/* =========================================================================
   SKINY 2.0
   - Každý skin se kupuje pro JEDNOHO konkrétního vojáka (skin pro pěšáka
     nedostane velitel ani lučištník).
   - Bonus určuje jen vzácnost – vyšší vzácnost je vždy znatelně silnější:
       zbraň:  základní +3 % útok · vzácná +5 % · epická +7 % · legendární +10 % útok a +10 % životy
       zbroj:  základní +3 % životy · vzácná +5 % · epická +7 % · legendární +10 % životy a +10 % útok
       božská (jen na kód): dvojnásobek legendární – +20 % útok a +20 % životy
   - Nové tvary zbraní, holí, přileb a štítů kreslí js/core/art_skiny.js.
   - Zbrojnice (stará výbava) je zrušená; co hráč měl, převede se na skiny.
   ========================================================================= */
window.GameData = window.GameData || {};

(function () {
  const G = GameData;
  const RARS = ['Základní', 'Vzácný', 'Epický', 'Legendární', 'Božský'];
  G.rarityColors['Božský'] = '#ff5a8a';
  const rr = { 'Základní': 0, 'Vzácný': 1, 'Epický': 2, 'Legendární': 3, 'Božský': 4 };
  G.rarityRank = r => rr[r] ?? 0;

  /* ---------------- NOVÉ SKINY ZBRANÍ ---------------- */
  const W = (id, name, rarity, cat, model, desc, en) => ({ id, name, rarity, cat, model: Object.assign({ cat }, model), desc, en });
  G.weaponSkins.push(
    // meče a zbraně na blízko
    W('w_gladius', 'Gladius', 'Základní', 'melee', { id: 'gladius', guard: '#c9a06a', grip: '#5a3a1e', pommel: '#c9a06a' }, 'Krátký široký meč římských legií s listovou čepelí.', { name: 'Gladius', desc: 'The short, broad, leaf-bladed sword of the Roman legions.' }),
    W('w_tesak', 'Tesák', 'Vzácný', 'melee', { id: 'tesak', guard: '#8a8f99', grip: '#3a2414' }, 'Jednobřitá čepel, která se ke špičce rozšiřuje. Seká jako sekera.', { name: 'Falchion', desc: 'A single-edged blade that widens to the tip. Cuts like an axe.' }),
    W('w_claymore', 'Claymore', 'Epický', 'melee', { id: 'claymore', guard: '#9aa3b0', grip: '#2a1a10' }, 'Obouruční skotský meč se šikmými rameny záštity.', { name: 'Claymore', desc: 'A two-handed Scottish sword with angled quillons.' }),
    W('w_tachi', 'Tači', 'Epický', 'melee', { id: 'tachi', guard: '#e8b84a', grip: '#1a1a2a' }, 'Delší a víc zahnutý meč jezdeckých samurajů s linií kalení.', { name: 'Tachi', desc: 'A longer, more curved cavalry samurai sword with a temper line.' }),
    W('w_remdih', 'Řemdih', 'Vzácný', 'melee', { id: 'morgenstern', wood: '#5a3a1e' }, 'Násada s ostnatou koulí. Prorazí štít i přilbu.', { name: 'Morning Star', desc: 'A haft with a spiked ball. Breaks shields and helmets.' }),
    W('w_cep', 'Bojový cep', 'Epický', 'melee', { id: 'cep', wood: '#6b4528' }, 'Ostnatá koule na řetězu – husitská hrůza na bojišti.', { name: 'Flail', desc: 'A spiked ball on a chain – the Hussite terror of the battlefield.' }),
    W('w_cakan', 'Čakan', 'Vzácný', 'melee', { id: 'cakan', wood: '#4a2e18', guard: '#8a8f99' }, 'Válečný krumpáč s dlouhým zahnutým bodcem.', { name: 'War Pick', desc: 'A war pick with a long curved spike.' }),
    W('w_tachi_drak', 'Dračí tači', 'Legendární', 'melee', { id: 'tachi', blade: '#ffe0d0', dark: '#9a3a20', glow: '#ff6a2a', guard: '#ffd24a', grip: '#5a0a14' }, 'Čepel kovaná v dračím ohni. Za každým sekem zůstává žár.', { name: 'Dragon Tachi', desc: 'A blade forged in dragon fire. Each cut leaves a trail of heat.' }),
    W('w_claymore_kral', 'Claymore horského krále', 'Legendární', 'melee', { id: 'claymore', blade: '#f4f8ff', guard: '#ffd24a', pommel: '#ffd24a', gem: '#2a8aff', glow: '#bfe0ff', grip: '#1a2a5a' }, 'Zlatá záštita a safír v hlavici. Čepel září jako horský led.', { name: 'Highland King’s Claymore', desc: 'A golden guard and a sapphire pommel. The blade shines like mountain ice.' }),
    W('w_remdih_pekla', 'Pekelný řemdih', 'Legendární', 'melee', { id: 'morgenstern', blade: '#4a3a3a', dark: '#1a0a0a', edge: '#ff9a5a', glow: '#ff3a1a', wood: '#2a0a06' }, 'Koule z černé oceli rozžhavená pekelným ohněm.', { name: 'Hellfire Morning Star', desc: 'A black steel ball glowing with hellfire.' }),
    // kopí
    W('k_pika', 'Píka', 'Základní', 'pole', { id: 'pika', wood: '#7a4c2a' }, 'Dlouhý úzký hrot. Jezdci se na ní zastaví.', { name: 'Pike', desc: 'A long narrow point that stops cavalry.' }),
    W('k_sudlice', 'Sudlice', 'Vzácný', 'pole', { id: 'sudlice', wood: '#6b4528' }, 'Husitská zbraň s dlouhou čepelí a bočním hákem.', { name: 'Sudlice', desc: 'A Hussite polearm with a long blade and a side hook.' }),
    W('k_bardis', 'Bardiš', 'Epický', 'pole', { id: 'bardisa', wood: '#4a2e18', guard: '#8a8f99' }, 'Obrovské půlměsícové ostří podél násady.', { name: 'Bardiche', desc: 'A huge crescent blade along the shaft.' }),
    W('k_kosa', 'Válečná kosa', 'Epický', 'pole', { id: 'kosa', wood: '#5a3a1e' }, 'Čepel kosy narovnaná do osy – zbraň husitských sedláků.', { name: 'War Scythe', desc: 'A scythe blade set straight on the shaft – the Hussite peasants’ weapon.' }),
    W('k_jumonji', 'Křížové kopí', 'Epický', 'pole', { id: 'jumonji', wood: '#2a1a1a', guard: '#e8b84a' }, 'Samurajské džúmondži jari se dvěma bočními čepelemi.', { name: 'Cross Spear', desc: 'A samurai jūmonji yari with two side blades.' }),
    W('k_jumonji_zlate', 'Zlaté křížové kopí', 'Legendární', 'pole', { id: 'jumonji', blade: '#fff0b8', dark: '#a47a24', glow: '#ffe28a', wood: '#5a0a14', guard: '#ffd24a', gem: '#d6243a' }, 'Křížové kopí šóguna ze zlata s rubínem.', { name: 'Golden Cross Spear', desc: 'The shogun’s gold cross spear with a ruby.' }),
    W('k_bardis_hrom', 'Hromový bardiš', 'Legendární', 'pole', { id: 'bardisa', blade: '#f4f8ff', dark: '#5a6a9a', glow: '#fff36a', wood: '#2a3a5a', guard: '#ffe14a' }, 'Ostří, ve kterém hřmí bouře.', { name: 'Thunder Bardiche', desc: 'A blade with a storm rumbling inside.' }),
    // luky
    W('l_kompozit', 'Kompozitní luk', 'Vzácný', 'bow', { id: 'kompozit', wood: '#5a3a1e' }, 'Krátký luk ze dřeva, rohoviny a šlach se stočenými konci.', { name: 'Composite Bow', desc: 'A short bow of wood, horn and sinew with curled tips.' }),
    W('l_sakura', 'Sakurový luk', 'Vzácný', 'bow', { id: 'sakura', wood: '#3a1a22', string: '#fff0f5' }, 'Lakovaný luk s kvetoucí sakurou.', { name: 'Sakura Bow', desc: 'A lacquered bow with cherry blossoms.' }),
    W('l_trny', 'Trnový luk', 'Epický', 'bow', { id: 'trny', wood: '#2a3a1a', blade: '#1a1a12', string: '#c9d8a0' }, 'Luk z černého trnu s ostny po celé délce.', { name: 'Thorn Bow', desc: 'A bow of black thorn with spikes along its length.' }),
    W('l_runovy', 'Runový luk', 'Epický', 'bow', { id: 'runovy', wood: '#4a3a5a', glow: '#7fc8ff', string: '#dff4ff' }, 'Na ramenou září modré runy.', { name: 'Rune Bow', desc: 'Blue runes glow on its limbs.' }),
    W('l_zlaty', 'Zlatý luk', 'Legendární', 'bow', { id: 'zlaty', wood: '#e8c45c', string: '#fff6d8', glow: '#ffe28a', gem: '#d6243a' }, 'Luk ze zlata s rubíny. Šípy letí jako paprsky slunce.', { name: 'Golden Bow', desc: 'A bow of gold with rubies. Its arrows fly like sunbeams.' }),
    // hole mágů
    W('h_dub', 'Dubová hůl', 'Základní', 'staff', { id: 'koule', glow: '#9fe07a' }, 'Prostá hůl z dubu se zelenou koulí.', { name: 'Oak Staff', desc: 'A plain oak staff with a green orb.' }),
    W('h_strom', 'Hůl živého stromu', 'Vzácný', 'staff', { id: 'strom', glow: '#b8ff8a' }, 'Pokroucené větve, které stále rostou a kvetou.', { name: 'Living Tree Staff', desc: 'Twisted branches that still grow and bloom.' }),
    W('h_krystal', 'Krystalová hůl', 'Vzácný', 'staff', { id: 'krystal', glow: '#7fd3ff' }, 'Šestiboký krystal v kovových drápech.', { name: 'Crystal Staff', desc: 'A hexagonal crystal held in metal claws.' }),
    W('h_had', 'Hadí hůl', 'Epický', 'staff', { id: 'had', glow: '#9dff6a' }, 'Had obtočený kolem hole drží v tlamě kouli.', { name: 'Serpent Staff', desc: 'A serpent coiled around the staff holds an orb in its jaws.' }),
    W('h_lebka', 'Hůl nekromanta', 'Epický', 'staff', { id: 'lebka', glow: '#b25cff' }, 'Lebka se zářícíma očima.', { name: 'Necromancer’s Staff', desc: 'A skull with glowing eyes.' }),
    W('h_slunce', 'Sluneční hůl', 'Legendární', 'staff', { id: 'slunce', glow: '#ffe28a' }, 'Zlatý sluneční kotouč s paprsky.', { name: 'Sun Staff', desc: 'A golden sun disc with rays.' }),
    W('h_mesic', 'Měsíční hůl', 'Legendární', 'staff', { id: 'mesic', glow: '#cfd8ff' }, 'Srpek měsíce kolem hvězdné koule.', { name: 'Moon Staff', desc: 'A crescent moon around a starry orb.' }),
    // BOŽSKÝ PADLÝ ANDĚL – jen na kód
    Object.assign(W('w_andel', 'Meč padlého anděla', 'Božský', 'melee', { id: 'andel', blade: '#2a2228', dark: '#0e0a0e', edge: '#ffd27a', glow: '#ff3a5a', guard: '#ffd24a', pommel: '#ffd24a', gem: '#ff2a4a', grip: '#1a0a10' }, 'Černá čepel se zlatým ostřím a rudou září. Vybavení tvůrce hry – BrosWars Studio.', { name: 'Fallen Angel’s Sword', desc: 'A black blade with a golden edge and a crimson glow. The game creator’s gear – BrosWars Studio.' }), { codeOnly: true }),
    Object.assign(W('k_andel', 'Kopí padlého anděla', 'Božský', 'pole', { id: 'andel', blade: '#2a2228', dark: '#0e0a0e', edge: '#ffd27a', glow: '#ff3a5a', wood: '#1a0a10', guard: '#ffd24a', gem: '#ff2a4a' }, 'Okřídlený hrot z černé oceli. Vybavení tvůrce hry – BrosWars Studio.', { name: 'Fallen Angel’s Spear', desc: 'A winged black steel head. The game creator’s gear – BrosWars Studio.' }), { codeOnly: true }),
    Object.assign(W('h_andel', 'Hůl padlého anděla', 'Božský', 'staff', { id: 'andel', glow: '#ff3a5a' }, 'Černá hůl s rudou koulí v sevření andělských křídel. Vybavení tvůrce hry – BrosWars Studio.', { name: 'Fallen Angel’s Staff', desc: 'A black staff with a crimson orb held by angel wings. The game creator’s gear – BrosWars Studio.' }), { codeOnly: true }),
    // BOŽSKÝ BOŽÍ KRÁL
    Object.assign(W('w_kral', 'Meč Božího krále', 'Božský', 'melee', { id: 'bozi', blade: '#fffdf2', dark: '#c9a24a', edge: '#ffffff', glow: '#ffe28a', guard: '#ffd24a', pommel: '#ffd24a', gem: '#5ab8ff', grip: '#f4efe0' }, 'Bílozlatá čepel zářící jako slunce, záštita se sluneční korunou.', { name: 'God-King’s Sword', desc: 'A white-gold blade shining like the sun, with a sun-crown guard.' }), { codeOnly: true }),
    Object.assign(W('k_kral', 'Kopí Božího krále', 'Božský', 'pole', { id: 'bozi', blade: '#fffdf2', dark: '#c9a24a', edge: '#ffffff', glow: '#ffe28a', wood: '#f4efe0', guard: '#ffd24a', gem: '#5ab8ff' }, 'Zlatý hrot se slunečním kotoučem na bílé násadě.', { name: 'God-King’s Spear', desc: 'A golden head with a sun disc on a white shaft.' }), { codeOnly: true }),
    Object.assign(W('l_kral', 'Luk Božího krále', 'Božský', 'bow', { id: 'bozi', wood: '#ffd24a', string: '#ffffff', glow: '#ffe28a', gem: '#5ab8ff', arrow: '#fff6d8', tip: '#ffd24a' }, 'Zlatý luk se slunečními paprsky a tětivou ze světla.', { name: 'God-King’s Bow', desc: 'A golden bow with sun rays and a string of light.' }), { codeOnly: true }),
    Object.assign(W('h_kral', 'Žezlo Božího krále', 'Božský', 'staff', { id: 'bozi', glow: '#ffe28a' }, 'Zlaté žezlo s korunou a zářící modrou koulí.', { name: 'God-King’s Scepter', desc: 'A golden scepter with a crown and a glowing blue orb.' }), { codeOnly: true }),
    Object.assign(W('l_andel', 'Luk padlého anděla', 'Božský', 'bow', { id: 'andel', wood: '#1a1418', string: '#ffd27a', glow: '#ff3a5a', gem: '#ff2a4a', arrow: '#2a2228', tip: '#ffd27a' }, 'Luk z černých andělských per se zlatou tětivou. Vybavení tvůrce hry – BrosWars Studio.', { name: 'Fallen Angel’s Bow', desc: 'A bow of black angel feathers with a golden string. The game creator’s gear – BrosWars Studio.' }), { codeOnly: true })
  );
  // samurajové: jen meč (katana, tači), kopí a luk
  G.SAM_OK.melee.push('tachi', 'andel', 'bozi');
  G.SAM_OK.pole.push('pika', 'jumonji', 'andel', 'bozi');

  /* ---------------- NOVÉ SKINY ZBROJE (každý mění tvar: přilbu, štít, plášť…) ---------------- */
  const S = (id, only, name, rarity, palette, feat, look, desc, en, extra) => Object.assign({ id, only, name, rarity, palette, feat, look, desc, en }, extra || {});
  G.unitSkins.push(
    /* KRÁLOVSTVÍ */
    S('r_pesak_bascinet', ['pesak'], 'Žoldnéř s bascinetem', 'Epický', { tunic: '#7a1a1a', tunicDark: '#4a0e0e', trim: '#e0c060', metal: '#dfe5ee', metalDark: '#7d8ea8' }, { pauldron: 'plate', cape: 'short', capeColor: '#4a0e0e', emblemColor: '#e0c060' }, { helmet: 'bascinet', shield: 'heater' }, 'Přilba bascinet s hledím „psí čumák“ a erbový štít s krokví.', { name: 'Bascinet Mercenary', desc: 'A bascinet with a “hounskull” visor and a chevron heater shield.' }),
    S('r_pesak_hus', ['pesak'], 'Husitský bojovník', 'Vzácný', { tunic: '#3a3a3a', tunicDark: '#1e1e1e', trim: '#c8262a', metal: '#c9ced6', metalDark: '#6b717b' }, { cape: 'short', capeColor: '#2a2a2a', emblemColor: '#c8262a' }, { shield: 'pavise' }, 'Pavéza s kalichem a tmavý plášť bojovníka božího.', { name: 'Hussite Warrior', desc: 'A pavise with a chalice and the dark cloak of God’s warrior.' }),
    S('r_luk_sallet', ['lucistnik'], 'Lučištník v salátu', 'Vzácný', { tunic: '#2a5a2a', tunicDark: '#173a17', trim: '#e0c060', metal: '#cfd4dc', metalDark: '#7b8592' }, { cape: 'short', capeColor: '#1f4a1f', crest: 'feather', plumeColor: '#e0c060' }, { helmet: 'sallet' }, 'Přilba salát s dlouhým týlem a průzorem.', { name: 'Sallet Archer', desc: 'A sallet helmet with a long tail and a visor slit.' }),
    S('r_kopi_pavise', ['kopinik'], 'Pavézník', 'Epický', { tunic: '#1f3a6a', tunicDark: '#122444', trim: '#ffd77a', metal: '#dfe5ee', metalDark: '#7d8ea8' }, { pauldron: 'plate', emblemColor: '#ffd77a', chest: 'cross' }, { helmet: 'sallet', shield: 'pavise' }, 'Vysoká pavéza a salát – živá hradba proti jízdě.', { name: 'Pavisier', desc: 'A tall pavise and a sallet – a living wall against cavalry.' }),
    S('r_rytir_krizak', ['rytir'], 'Křižák s velkou přilbou', 'Legendární', { tunic: '#f1ede2', tunicDark: '#c9c1ad', trim: '#c8262a', metal: '#eef3fa', metalDark: '#8b96a6', cape: '#f4efe0', plume: '#c8262a' }, { pauldron: 'plate', chest: 'cross', emblemColor: '#c8262a', cape: 'royal', capeColor: '#f4efe0', trim: '#c8262a', crest: 'wings', wingColor: '#ffffff' }, { shield: 'heater' }, 'Bílý plášť s křížem, křídla na přilbě a erbový štít.', { name: 'Crusader Knight', desc: 'A white cloak with a cross, wings on the helm and a heater shield.' }),
    S('r_jezdec_sallet', ['jezdec'], 'Jezdec v salátu', 'Epický', { tunic: '#5a1a5a', tunicDark: '#3a0e3a', trim: '#e0c060', cape: '#5a1a5a', plume: '#e0c060' }, { cape: 'royal', capeColor: '#5a1a5a', pauldron: 'plate' }, { helmet: 'sallet', shield: 'heater' }, 'Salát s bradovým chráničem a purpurový plášť.', { name: 'Sallet Rider', desc: 'A sallet with a bevor and a purple cloak.' }),
    S('r_mag_kapuce', ['mag'], 'Hvězdář v kápi', 'Vzácný', { tunic: '#1a2a5a', tunicDark: '#0e1a3a', trim: '#e0d8ff', hood: '#1a2a5a' }, { aura: 'frost', chest: 'star', emblemColor: '#e0d8ff', collar: 'chain' }, { helmet: 'hood' }, 'Hluboká kápě místo klobouku a hvězda na hrudi.', { name: 'Hooded Astronomer', desc: 'A deep hood instead of a hat and a star on the chest.' }),
    S('r_velitel_bascinet', ['velitel'], 'Maršál s bascinetem', 'Legendární', { tunic: '#7a0f1e', tunicDark: '#4a0812', trim: '#ffd77a', metal: '#f0cf6a', metalDark: '#9a6e1c', cape: '#7a0f1e' }, { cape: 'ermine', capeColor: '#7a0f1e', collar: 'ermine', pauldron: 'gold', chest: 'lion', emblemColor: '#ffe08a' }, { helmet: 'bascinet', shield: 'heater' }, 'Zlacený bascinet, hermelín a erbový štít maršála.', { name: 'Bascinet Marshal', desc: 'A gilded bascinet, ermine and the marshal’s heater shield.' }),
    /* SAMURAJOVÉ */
    S('s_asi_kabuto', ['asigaru'], 'Ašigaru veterán', 'Vzácný', { tunic: '#3a3a4a', tunicDark: '#22222c', trim: '#c8262a', metal: '#3a3438', metalDark: '#1a1618' }, { pauldron: 'samurai', chest: 'mon', emblemColor: '#c8262a' }, { helmet: 'kabuto' }, 'Veterán dostal skutečnou přilbu kabuto místo klobouku.', { name: 'Ashigaru Veteran', desc: 'The veteran earned a real kabuto helmet instead of a hat.' }),
    S('s_jumi_stin', ['jumi'], 'Stínová lučištnice', 'Epický', { tunic: '#1a1a22', tunicDark: '#0e0e14', trim: '#8a2a3a', hood: '#1a1a22', metal: '#2a2a32', metalDark: '#141418' }, { aura: 'shadow', cape: 'tattered', capeColor: '#1a1a22' }, { helmet: 'hood' }, 'Černá kápě a roztrhaný plášť – útočí ze tmy.', { name: 'Shadow Archer', desc: 'A black hood and a torn cloak – she strikes from the dark.' }),
    S('s_jari_zunari', ['jari'], 'Strážce mostu', 'Epický', { tunic: '#2a3a5a', tunicDark: '#18243a', trim: '#e8b84a', metal: '#2a2528', metalDark: '#141113' }, { pauldron: 'samurai', chest: 'mon' }, { helmet: 'zunari' }, 'Přilba zunari s maskou a zlatým srpkem měsíce.', { name: 'Bridge Guardian', desc: 'A zunari helmet with a mask and a golden crescent moon.' }),
    S('s_sam_tsuki', ['samuraj'], 'Pán měsíce', 'Legendární', { tunic: '#141218', tunicDark: '#0a090c', trim: '#ffd24a', metal: '#1e1a20', metalDark: '#0e0c0e', cape: '#5a0a14' }, { pauldron: 'samurai', chest: 'mon', emblemColor: '#ffd24a', cape: 'royal', capeColor: '#5a0a14', aura: 'petals' }, { helmet: 'zunari' }, 'Černá zbroj, maska a zlatý srpek měsíce slavného daimjó.', { name: 'Lord of the Moon', desc: 'Black armor, a mask and the famous daimyō’s golden crescent.' }),
    S('s_kiba_zunari', ['kiba'], 'Jezdec rudé hřívy', 'Epický', { tunic: '#8a1414', tunicDark: '#5a0a0a', trim: '#e8b84a', metal: '#2a2528', metalDark: '#141113' }, { pauldron: 'samurai', crest: 'mohawk', plumeColor: '#c8262a' }, { helmet: 'zunari' }, 'Zunari s rudým hřebenem a maskou.', { name: 'Red Mane Rider', desc: 'A zunari with a red crest and a mask.' }),
    S('s_onm_dvorni', ['onmyoji'], 'Dvorní věštec', 'Vzácný', { tunic: '#f4f0e8', tunicDark: '#c8c0b0', trim: '#c8262a' }, { aura: 'petals', chest: 'mon', emblemColor: '#c8262a' }, { helmet: 'jingasa' }, 'Bílé roucho a klobouk džingasa.', { name: 'Court Diviner', desc: 'A white robe and a jingasa hat.' }),
    S('s_taisho_tsuki', ['taisho'], 'Šógun půlměsíce', 'Legendární', { tunic: '#1e1a1c', tunicDark: '#0e0c0d', trim: '#ffd24a', metal: '#2a2528', metalDark: '#141113', cape: '#8a1414' }, { pauldron: 'samurai', chest: 'mon', cape: 'ermine', capeColor: '#8a1414', emblemColor: '#ffd24a' }, { helmet: 'zunari' }, 'Generál se zlatým srpkem a pláštěm s hermelínem.', { name: 'Crescent Shogun', desc: 'The general with a golden crescent and an ermine-lined cloak.' }),
    /* VIKINGOVÉ */
    S('v_val_spangen', ['valecnik'], 'Válečník ze Sveje', 'Vzácný', { tunic: '#6a3a1a', tunicDark: '#44240e', trim: '#e0c060', metal: '#d9dee6', metalDark: '#7d8694' }, { collar: 'fur', emblemColor: '#e0c060' }, { helmet: 'spangen', shield: 'spiral' }, 'Kónická přilba spangenhelm a štít se spirálou.', { name: 'Svea Warrior', desc: 'A conical spangenhelm and a spiral shield.' }),
    S('v_lov_medved', ['lovec'], 'Medvědí lovec', 'Epický', { tunic: '#4a3a24', tunicDark: '#2e2416', trim: '#c9a06a', bear: '#4a3424' }, { cape: 'pelt', furColor: '#5a3f2a', collar: 'fur' }, { helmet: 'bear' }, 'Medvědí hlava místo kapuce a kožešina přes záda.', { name: 'Bear Hunter', desc: 'A bear head instead of a hood and a fur over the back.' }),
    S('v_stit_spangen', ['stitonos'], 'Štítonoš z Uppsaly', 'Epický', { tunic: '#2a4a6a', tunicDark: '#182e44', trim: '#ffd77a', metal: '#dbe8ff', metalDark: '#6a84b0' }, { collar: 'fur', furColor: '#e8e4dc', pauldron: 'fur', emblemColor: '#ffd77a' }, { helmet: 'spangen', shield: 'spiral' }, 'Spangenhelm s kroužkovým závěsem a zlatá spirála na štítu.', { name: 'Uppsala Shieldbearer', desc: 'A spangenhelm with a mail curtain and a gold spiral shield.' }),
    S('v_ber_spangen', ['berserk'], 'Berserk v přilbě', 'Vzácný', { tunic: '#5a2a1a', tunicDark: '#3a1a0e', trim: '#c9a06a' }, { pauldron: 'fur', cape: 'pelt', furColor: '#7a5a3a' }, { helmet: 'spangen' }, 'Berserk tentokrát v ocelové přilbě s nánosníkem.', { name: 'Helmed Berserker', desc: 'A berserker in a steel nasal helmet this time.' }),
    S('v_jez_spangen', ['jezdec_sever'], 'Jezdec fjordů', 'Epický', { tunic: '#2a5a5a', tunicDark: '#173a3a', trim: '#e0c060' }, { cape: 'royal', capeColor: '#173a3a', collar: 'fur' }, { helmet: 'spangen', shield: 'spiral' }, 'Spangenhelm, štít se spirálou a tmavozelený plášť.', { name: 'Fjord Rider', desc: 'A spangenhelm, a spiral shield and a dark green cloak.' }),
    S('v_volva_vlk', ['volva'], 'Vlčí věštkyně', 'Vzácný', { tunic: '#3a3a4a', tunicDark: '#24242e', trim: '#9dffd0', fur: '#9aa0aa' }, { aura: 'aurora', collar: 'wolf', furColor: '#9aa0aa' }, { helmet: 'furhood' }, 'Vlčí kožešina a polární záře kolem věštkyně.', { name: 'Wolf Seeress', desc: 'Wolf fur and an aurora around the seeress.' }),
    S('v_jarl_kral', ['jarl'], 'Král fjordů', 'Legendární', { tunic: '#2a2a5a', tunicDark: '#18183a', trim: '#ffd24a', metal: '#f0cf6a', metalDark: '#9a6e1c', cape: '#2a2a5a' }, { cape: 'ermine', capeColor: '#2a2a5a', collar: 'wolf', crest: 'wings', pauldron: 'gold', emblemColor: '#ffd24a' }, { helmet: 'spangen', shield: 'spiral' }, 'Zlatý spangenhelm s křídly, vlčí límec a zlatá spirála.', { name: 'King of the Fjords', desc: 'A golden winged spangenhelm, a wolf collar and a golden spiral.' }),
    /* BOŽSKÝ PADLÝ ANDĚL – zbroj tvůrce hry (jen na kód) */
    S('kral_bozi', null, 'Božský Boží král', 'Božský',
      { tunic: '#f4efe0', tunicDark: '#d6cdb6', trim: '#ffd24a', metal: '#ffe9a0', metalDark: '#c9a24a', cape: '#fffbe8', plume: '#ffffff', eyes: '#5ab8ff', hood: '#f4efe0', hat: '#f4efe0', lace: '#ffd24a', mask: '#ffe9a0', sashi: '#fffbe8', mon: '#ffd24a', crest: '#ffd24a', robe: '#f4efe0', fur: '#fffbe8', bear: '#f4efe0', hair: '#f2e0a0' },
      { wings: 'divine', aura: 'divine', pauldron: 'gold', gem: '#5ab8ff', chest: 'sun', emblemColor: '#ffd24a', cape: 'ermine', capeColor: '#fffbe8', collar: 'ermine', wingColor: '#fffbe8' },
      null, 'Bílozlatá zbroj, koruna, zlatá křídla a sluneční svatozář. Nejvyšší moc na bojišti.', { name: 'Divine God-King', desc: 'White-gold armor, a crown, golden wings and a sun halo. The highest power on the battlefield.' }, { codeOnly: true, glow: '#ffe28a', ornament: 'crown' }),
    S('andel', null, 'Božský padlý anděl', 'Božský',
      { tunic: '#1a1418', tunicDark: '#0a080a', trim: '#ffd24a', metal: '#2a2228', metalDark: '#0e0a0e', cape: '#3a0a14', plume: '#ff2a4a', eyes: '#ff2a4a', hood: '#1a1418', hat: '#1a1418', lace: '#a8162a', mask: '#1a1418', sashi: '#1a1418', mon: '#ffd24a', crest: '#ffd24a', robe: '#1a1418', fur: '#2a2228', bear: '#2a2228', hair: '#2a2228' },
      { wings: 'fallen', aura: 'fallen', pauldron: 'gold', gem: '#ff2a4a', chest: 'star', emblemColor: '#ffd24a', cape: 'tattered', capeColor: '#2a060c', crest: 'wings', wingColor: '#1a1418' },
      null, 'Černozlatá zbroj, obří černá křídla a rudá záře. Zbroj samotného tvůrce hry – BrosWars Studio.', { name: 'Divine Fallen Angel', desc: 'Black-gold armor, huge black wings and a crimson glow. The game creator’s own armor – BrosWars Studio.' }, { codeOnly: true, glow: '#ff3a5a' })
  );

  /* ---------------- PEVNÉ BONUSY A CENY PODLE VZÁCNOSTI ---------------- */
  const WB = [{ dmg: 0.03 }, { dmg: 0.05 }, { dmg: 0.07 }, { dmg: 0.1, hp: 0.1 }, { dmg: 0.2, hp: 0.2 }];
  const AB = [{ hp: 0.03 }, { hp: 0.05 }, { hp: 0.07 }, { hp: 0.1, dmg: 0.1 }, { hp: 0.2, dmg: 0.2 }];
  const PRICE = [{ gold: 1500 }, { gold: 3500 }, { gems: 180 }, { gems: 450 }, {}];
  G.unitSkins.forEach(s => {
    if (s.id === 'zakladni') { s.bonus = null; return; }
    if (s.exclusive) s.rarity = 'Legendární';
    const r = rr[s.rarity] ?? 0;
    s.bonus = Object.assign({}, AB[r]);
    s.cost = Object.assign({}, PRICE[r]);
  });
  G.weaponSkins.forEach(w => {
    if (!w.model) { w.bonus = null; return; }
    const r = rr[w.rarity] ?? 0;
    w.bonus = Object.assign({}, WB[r]);
    w.cost = Object.assign({}, PRICE[r]);
  });

  /* ---------------- VLASTNICTVÍ PO JEDNOTKÁCH ---------------- */
  const Own = G.skinOwn = {
    ensure(save) {
      const sk = save.skins;
      sk.own = sk.own || {}; sk.ownW = sk.ownW || {}; sk.weapon = sk.weapon || {}; sk.unit = sk.unit || {};
      return sk;
    },
    has(save, uid, sid) { if (!sid || sid === 'zakladni') return true; const sk = this.ensure(save); return (sk.own[uid] || []).includes(sid); },
    hasW(save, uid, wid) { if (!wid || wid === 'w_zakladni') return true; const sk = this.ensure(save); return (sk.ownW[uid] || []).includes(wid); },
    add(save, uid, sid) { const sk = this.ensure(save); const a = sk.own[uid] || (sk.own[uid] = []); if (!a.includes(sid)) { a.push(sid); return true; } return false; },
    addW(save, uid, wid) { const sk = this.ensure(save); const a = sk.ownW[uid] || (sk.ownW[uid] = []); if (!a.includes(wid)) { a.push(wid); return true; } return false; },
    /* hráčské jednotky (bez bossů a démonů) */
    units() { return G.factionOrder.filter(f => !G.factions[f].enemyOnly).flatMap(f => G.factionUnits(f)); },
    unitsOfRole(role) { return this.units().filter(u => G.units[u].roleKey === role); },
    armorFor(uid, rarity, exclude) { return G.unitSkins.filter(s => s.id !== 'zakladni' && !s.codeOnly && !s.exclusive && s.rarity === rarity && G.skinFits(s, uid) && !(exclude || []).includes(s.id)); },
    weaponFor(uid, rarity, exclude) { return G.weaponSkins.filter(w => w.model && !w.codeOnly && w.rarity === rarity && G.weaponSkinFits(w, uid) && !(exclude || []).includes(w.id)); }
  };

  /* Převod starého ukládání (jednou): nic se neztratí.
     - skiny koupené dřív platily pro všechny vojáky → zůstanou všem, kterým pasují
     - stará výbava ze Zbrojnice → skiny stejné vzácnosti pro vojáky dané role (a hned se nasadí) */
  G.skinMigrate = save => {
    if (save.mig_skin2) return false;
    const sk = Own.ensure(save);
    const units = Own.units();
    (sk.ownedUnit || []).forEach(id => {
      if (id === 'zakladni') return;
      const s = G.unitSkins.find(x => x.id === id); if (!s) return;
      if (s.exclusive) { const u = save.loyalSkinUnit; if (u) Own.add(save, u, id); else units.forEach(u2 => G.skinFits(s, u2) && Own.add(save, u2, id)); return; }
      units.forEach(u => { if (G.skinFits(s, u)) Own.add(save, u, id); });
    });
    (sk.ownedWeapon || []).forEach(id => {
      const w = G.weaponSkins.find(x => x.id === id); if (!w || !w.model) return;
      units.forEach(u => { if (G.weaponSkinFits(w, u)) Own.addW(save, u, id); });
    });
    const gear = save.gear || {};
    (gear.owned || []).forEach(gid => {
      const g = G.gearById && G.gearById(gid); if (!g) return;
      const rar = RARS[g.tier] || 'Základní';
      const eqd = ((gear.eq || {})[g.role] || {})[g.slot] === gid;
      Own.unitsOfRole(g.role).forEach(u => {
        if (g.slot === 'weapon') {
          const c = Own.weaponFor(u, rar)[0]; if (!c) return;
          Own.addW(save, u, c.id);
          if (eqd && (!sk.weapon[u] || sk.weapon[u] === 'w_zakladni')) sk.weapon[u] = c.id;
        } else {
          const c = Own.armorFor(u, rar).sort((a, b) => (b.only ? 1 : 0) - (a.only ? 1 : 0))[0]; if (!c) return;
          Own.add(save, u, c.id);
          if (eqd && (!sk.unit[u] || sk.unit[u] === 'zakladni')) sk.unit[u] = c.id;
        }
      });
    });
    // nasazené skiny, které jednotka nevlastní (staré „nasadit všem“), se ponechají jen pokud je vlastní
    Object.keys(sk.unit).forEach(u => { if (!Own.has(save, u, sk.unit[u])) Own.add(save, u, sk.unit[u]); });
    Object.keys(sk.weapon).forEach(u => { if (!Own.hasW(save, u, sk.weapon[u])) Own.addW(save, u, sk.weapon[u]); });
    save.mig_skin2 = 1;
    return true;
  };

  G.andelUpgrade = save => {
    if (save.mig_andel2) return false;
    const sk = Own.ensure(save);
    const has = Object.keys(sk.own).some(u => (sk.own[u] || []).includes('andel'));
    save.mig_andel2 = 1;
    if (!has) return true;
    const s0 = G.unitSkins.find(x => x.id === 'andel');
    Own.units().forEach(u => {
      if (G.skinFits(s0, u) && Own.add(save, u, 'andel') && (!sk.unit[u] || sk.unit[u] === 'zakladni')) sk.unit[u] = 'andel';
      const w = ['w_andel', 'k_andel', 'l_andel', 'h_andel'].map(id => G.weaponSkins.find(x => x.id === id)).find(x => G.weaponSkinFits(x, u));
      if (w && Own.addW(save, u, w.id) && (!sk.weapon[u] || sk.weapon[u] === 'w_zakladni')) sk.weapon[u] = w.id;
    });
    return true;
  };

  /* Náhodný skin, který hráč ještě NEMÁ (truhly a balíčky).
     rarityOdds = šance [základní, vzácná, epická, legendární]; units = komu může padnout */
  G.randomSkin = (save, rarityOdds, units, kind) => {
    units = units || Own.units();
    let r = Math.random(), acc = 0, tier = 0;
    for (let i = 0; i < rarityOdds.length; i++) { acc += rarityOdds[i]; if (r <= acc) { tier = i; break; } }
    const all = [];
    for (let t2 = tier; t2 >= 0 && !all.length; t2--) {
      units.forEach(u => {
        if (kind !== 'w') Own.armorFor(u, RARS[t2]).forEach(s => { if (!Own.has(save, u, s.id)) all.push({ k: 'a', uid: u, id: s.id }); });
        if (kind !== 'a') Own.weaponFor(u, RARS[t2]).forEach(w => { if (!Own.hasW(save, u, w.id)) all.push({ k: 'w', uid: u, id: w.id }); });
      });
    }
    return all.length ? all[Math.floor(Math.random() * all.length)] : null;
  };

  /* BOŽSKÉ SETY: zbroj + zbraň pro všechny vojáky všech národů (kód nebo balíček v obchodě) */
  G.divineSets = {
    andel: { armor: 'andel', weapons: ['w_andel', 'k_andel', 'l_andel', 'h_andel'], name: 'Božský padlý anděl', en: 'Divine Fallen Angel', price: { gems: 2500 } },
    kral: { armor: 'kral_bozi', weapons: ['w_kral', 'k_kral', 'l_kral', 'h_kral'], name: 'Božský Boží král', en: 'Divine God-King', price: { gems: 2500 } }
  };
  const giveSet = (save, id) => {
    const D = G.divineSets[id], got = [];
    const s0 = G.unitSkins.find(x => x.id === D.armor);
    Own.units().forEach(u => {
      if (G.skinFits(s0, u)) { Own.add(save, u, D.armor); save.skins.unit[u] = D.armor; got.push({ k: 'a', uid: u, id: D.armor }); }
      const w = D.weapons.map(x => G.weaponSkins.find(y => y.id === x)).find(x => G.weaponSkinFits(x, u));
      if (w) { Own.addW(save, u, w.id); save.skins.weapon[u] = w.id; got.push({ k: 'w', uid: u, id: w.id }); }
    });
    return got;
  };
  /* má hráč set kompletní? */
  G.divineOwned = (save, id) => { const D = G.divineSets[id]; Own.ensure(save); return Own.units().every(u => Own.has(save, u, D.armor)); };
  G.codeSets = { andel: save => giveSet(save, 'andel'), kral: save => giveSet(save, 'kral') };
})();
