/* =========================================================================
   ANGLICKÝ OBSAH HRY (používá se pro všechny jazyky kromě češtiny)
   + doplňkové krátké texty rozhraní přeložené do všech jazyků
   ========================================================================= */
(function () {
  const U = (name, role, desc) => ({ name, role, desc });
  window.I18N_EN = {
    units: {
      pesak: U('Footman', 'Infantry', 'Cheap swordsman with a shield. Holds the front and covers the archers.'),
      lucistnik: U('Archer', 'Ranged', 'Shoots arrows from far away. Fragile, needs cover.'),
      kopinik: U('Spearman', 'Anti-heavy', 'Long spear gives reach. Deals double damage to heavy units.'),
      rytir: U('Knight', 'Heavy unit', 'Plate armor absorbs a third of damage. Slow but devastating.'),
      asigaru: U('Ashigaru', 'Infantry', 'Foot soldier in lacquered armor and a jingasa hat. Fast and cheap.'),
      jumi: U('Yumi Ashigaru', 'Archer', 'Shoots a tall yumi bow. Longest range of all archers.'),
      jari: U('Yari Ashigaru', 'Spearman', 'The long yari keeps enemies at bay. Double damage to heavy units.'),
      samuraj: U('Samurai', 'Elite warrior', 'Sword master in ō-yoroi armor. His first strike (iaidō) deals double damage. Faster than a knight, less armored.'),
      valecnik: U('Warrior', 'Infantry', 'Free karl with an axe and round shield. Tougher than a footman, but slower.'),
      lovec: U('Hunter', 'Archer', 'Hunter from the northern woods. Shoots faster, but at shorter range.'),
      stitonos: U('Shieldbearer', 'Shield wall', 'Spear and big shield. Tough (25% armor), 1.8× damage to heavy units.'),
      bes: U('Imp', 'Hellspawn', 'Small horned demon with claws. Fast and cheap, attacks in swarms.'),
      chrlic: U('Fire Spitter', 'Fire thrower', 'Hurls fireballs. Slightly shorter range than an archer, but burns harder.'),
      rohac: U('Horned Warden', 'Trident spearman', 'The trident keeps enemies at bay and deals 1.8× damage to heavy units.'),
      zatracenec: U('Damned Knight', 'Hell knight', 'A fallen knight in black armor with a flaming sword. Very tough.'),
      demonkral: U('Demon King', 'Lord of the Underworld', 'Azgaroth, the Demon King. Huge – his flaming sword hits up to five enemies at once.'),
      berserk: U('Berserker', 'Raging warrior', 'Fights in a bear pelt with a Dane axe. No armor, but below half health he enters a rage (+60% attack).')
    },
    factions: {
      kralovstvi: { name: 'Kingdom', people: 'Knights of the Lion Crown', desc: 'Heavily armored knights, disciplined infantry and stone castles.', strengths: 'Best armor, strong knights.', prologue: 'The Kingdom of the Lion Crown lived in peace for years. Now villages burn on the border, raiders sail in from the north and the Shadow Legion awakens in the mountains. As the king’s marshal you must defend the realm.' },
      samurajove: { name: 'Samurai', people: 'Kazehana Clan', desc: 'Swift sword masters, ashigaru with yari spears and bows with the longest range.', strengths: 'Longest range, fast units, powerful first strike.', prologue: 'The Land of the Rising Sun is divided. The Akabane clan burns the rice fields of Kiri province and Regent Kurogane craves the shogun’s power. As the young daimyō of the Kazehana clan you must unite the provinces and protect the emperor.' },
      demoni: { name: 'Demons', people: 'Legion of the Demon King', desc: 'Imps, fire spitters and damned knights from the Fire Mountain.', strengths: 'Fast imps, fireballs, tough hell knights.', prologue: 'A thousand years ago three nations sealed the Demon King Azgaroth beneath the Fire Mountain. The seal is weakening.' },
      vikingove: { name: 'Vikings', people: 'Jarls of the Storm Fjord', desc: 'Tough axe warriors, shield walls and raging berserkers.', strengths: 'Most health, cheap tough infantry, berserkers.', prologue: 'Jarl Hrafn the Cruel has taken half the fjords and the Kingdom grows strong in the south. Far in the north the Frost Crown awakens and the skalds sing of Ragnarök. As the young jarl of the Storm Fjord you must unite the clans and write your own saga.' }
    },
    org: {
      'kralovstvi:0': { title: 'King', sub: 'Ruler of the Lion Crown', desc: 'Declares war and resides in the capital castle.' },
      'kralovstvi:1': { title: 'Marshal', sub: 'You – commander of the field army', desc: 'Commands formations, sends units and leads battles.' },
      'kralovstvi:2': { title: 'Knights', desc: 'Nobles in plate armor. The army’s striking force.' },
      'kralovstvi:3': { title: 'Sergeants', sub: 'Leaders of foot companies', desc: 'Keep the infantry and spearmen together.' },
      'kralovstvi:3:0': { title: 'Footmen' }, 'kralovstvi:3:1': { title: 'Spearmen' },
      'kralovstvi:4': { title: 'Archers', desc: 'Free peasants with longbows. They cover the front from behind.' },
      'samurajove:0': { title: 'Shogun', sub: 'Military ruler of the land', desc: 'Daimyō swear loyalty to him. Regent Kurogane wants his place.' },
      'samurajove:1': { title: 'Daimyō', sub: 'You – lord of the Kazehana clan', desc: 'Rules the province, the castle and the clan’s army.' },
      'samurajove:2': { title: 'Karō', sub: 'Chief advisors', desc: 'Command the army’s wings and advise on tactics.' },
      'samurajove:3': { title: 'Samurai', desc: 'Noble warriors bound by the code of bushidō.' },
      'samurajove:4': { title: 'Ashigaru-gashira', sub: 'Ashigaru captains', desc: 'Lead foot soldiers in tight formation.' },
      'samurajove:4:0': { title: 'Ashigaru' }, 'samurajove:4:1': { title: 'Yari Ashigaru' }, 'samurajove:4:2': { title: 'Yumi Ashigaru' },
      'vikingove:0': { title: 'Thing', sub: 'Assembly of free men', desc: 'Settles disputes and elects the king. A jarl needs its support.' },
      'vikingove:1': { title: 'Jarl', sub: 'You – ruler of the Storm Fjord', desc: 'Leads raids, shares the loot and commands the warriors.' },
      'vikingove:2': { title: 'Hirð', sub: 'Personal retinue of housecarls', desc: 'The most loyal warriors, sworn to the jarl for life.' },
      'vikingove:2:0': { title: 'Berserkers' }, 'vikingove:2:1': { title: 'Shieldbearers' },
      'vikingove:3': { title: 'Karls', sub: 'Free farmers and warriors', desc: 'The core of the host; they fight for loot.' },
      'vikingove:3:0': { title: 'Warriors' }, 'vikingove:3:1': { title: 'Hunters' },
      'vikingove:4': { title: 'Thralls', sub: 'Bondsmen', desc: 'They do not fight. They row the ships and tend the settlements.' }
    },
    chapters: {
      'kralovstvi:1': { name: 'Green Valley', intro: 'Border villages are burning. Viking raiders have come from the sea – but they seem to be fleeing from something.', outro: 'The captured chieftain Ulf admitted that Hrafn the Cruel and his black runes drove his people from home. Meanwhile the Shadow Legion has risen in the mountains.' },
      'kralovstvi:2': { name: 'Dark Mountains', intro: 'In the mountains the Shadow Legion of the traitor Duke Morvan awakens.', outro: 'Morvan has fallen. In his keep you found letters sealed with a horned crown – the sign of the Demon King. The Legion marches on the capital!' },
      'kralovstvi:3': { name: 'The Besieged Crown', intro: 'The remains of the Shadow Legion and the first imps from hell besiege King Aldric’s capital.', outro: 'The demons vanished in fire, but their leader cried out a name: Azgaroth. The king sends you east to the Kazehana clan, keepers of the second seal.' },
      'samurajove:1': { name: 'Kiri Province', intro: 'The red wings of the Akabane clan plunder the misty Kiri valley. The Lion Crown’s marshal fights beside young daimyō Ryū.', outro: 'Lord Akabane surrendered. He says Regent Kurogane drove him to war – and that the regent speaks with fire at night.' },
      'samurajove:2': { name: 'Kurama Mountains', intro: 'Akabane remnants, mountain monks and the regent’s brother hide in the high peaks.', outro: 'General Kurogane died saying: “My brother is no longer human.” The road to the capital is open.' },
      'samurajove:3': { name: 'Road to the Capital', intro: 'Regent Kurogane holds the emperor captive and the second seal weakens beneath the palace.', outro: 'An oni demon mask fell from the regent’s face. The emperor is free and the Kazehana clan swears loyalty to the alliance. The last seal lies in the far north.' },
      'vikingove:1': { name: 'Home Fjords', intro: 'Jarl Hrafn the Cruel swore loyalty to the Frost Crown and conquers the fjords. Jarl Sigrun needs your help.', outro: 'Hrafn has fallen. His black rune crumbled to ash and the wind carried it north, to the Frozen Wastes.' },
      'vikingove:2': { name: 'Frozen Wastes', intro: 'Beyond the fjords lie the Frozen Wastes, guarded by the ice guard – fallen knights of an ancient crusade, raised by frost.', outro: 'The Ice Gate has fallen. Beyond it rises the citadel of the Frost Crown under a burning red sky.' },
      'vikingove:3': { name: 'Ragnarök', intro: 'The Frost Crown, Azgaroth’s herald, is breaking the last seal. The twilight of the gods begins.', outro: 'The Frost Crown shattered. For the first time in a thousand years three nations stand together – but the last seal has cracked.' },
      'spojenectvi:1': { name: 'Gate of Hell', intro: 'The united armies of three nations march across the scorched plains to the Fire Mountain.', outro: 'The Gate of Hell is taken. Azgaroth waits at the summit of the Fire Mountain.' },
      'spojenectvi:2': { name: 'Fire Mountain', intro: 'The last climb to the Demon King’s throne.', outro: 'Azgaroth has fallen. The Fire Mountain is silent.' }
    },
    levels: {
      '1-1': { name: 'Border Ford', story: 'A raider patrol holds the ford by the village. Drive them back to their ships.' },
      '1-2': { name: 'River Mill', story: 'Raiders have taken the mill and their hunters shoot from the tower.' },
      '1-3': { name: 'Forest Path', story: 'Ambush parties lurk in the forest. After victory, spearmen will join you.' },
      '1-4': { name: 'Watch Hill', story: 'The first berserkers have reached the hill. Hold the formation!' },
      '1-5': { name: 'Camp Vranov', story: 'Chieftain Ulf Black-Rune built a palisade at Vranov. Tear it down and drive the raiders out to sea.' },
      '2-1': { name: 'Raven Pass', story: 'Spearmen of the Shadow Legion guard the narrow pass.' },
      '2-2': { name: 'Abandoned Mine', story: 'Black steel is forged in the mine. Stop the weapon making.' },
      '2-3': { name: 'Stone Bridge', story: 'The only way on leads across a bridge over the abyss.' },
      '2-4': { name: 'Volcano Gate', story: 'The gate to the heart of the mountains stands on a volcano’s slope. Sulfur smoke rises from the cracks.' },
      '2-5': { name: 'Black Fang Keep', story: 'Duke Morvan, the Dark Lord, leads the Legion himself. This will be a hard battle.' },
      '3-1': { name: 'Burning Fields', story: 'The Legion burns the fields around the capital. Stop it before the defenders starve.' },
      '3-2': { name: 'Hilltop Monastery', story: 'Monks report small horned creatures crawling from the cellars. Clear the monastery.' },
      '3-3': { name: 'City Walls', story: 'The enemy holds the outer walls. Take them back.' },
      '3-4': { name: 'Royal Garden', story: 'Traitors opened a secret gate in the garden and imps with spitters follow them. Stop them before they reach the palace.' },
      '3-5': { name: 'Throne Room', story: 'A hell gate has opened in the throne room. For the first time you face real demons!' },
      's1-1': { name: 'Rice Fields', story: 'Akabane ashigaru are stealing the harvest. The farmers beg for help.' },
      's1-2': { name: 'Bamboo Grove', story: 'Yumi archers hide in the bamboo grove.' },
      's1-3': { name: 'Torii Gate', story: 'The enemy desecrated the shrine. After victory, yari spearmen will join you.' },
      's1-4': { name: 'Mountain Temple', story: 'The first samurai of the Akabane clan await you at the temple.' },
      's1-5': { name: 'Akabane Castle', story: 'Lord Akabane Hidemasa has locked himself in his castle. Take it and unite Kiri.' },
      's2-1': { name: 'Pass of Mist', story: 'The mist is so thick you will hear the enemy before you see him.' },
      's2-2': { name: 'Warrior Monk Monastery', story: 'The sōhei monks joined the enemy. Show them the strength of the Kazehana clan.' },
      's2-3': { name: 'Red River Bridge', story: 'Shadow samurai of Regent Kurogane appear on the bridge.' },
      's2-4': { name: 'Fortress in the Clouds', story: 'A castle above the clouds guards the only road to the capital.' },
      's2-5': { name: 'General Kurogane', story: 'The regent’s brother commands the shadow army. Defeat him and the road will be open.' },
      's3-1': { name: 'Tōkaidō Road', story: 'The regent’s reinforcements march along the main road.' },
      's3-2': { name: 'Sakura Pass', story: 'Among blooming cherry trees it will be decided who passes.' },
      's3-3': { name: 'Night Attack', story: 'The regent attacked at night – and horned shadows run with his soldiers. Hold the formation.' },
      's3-4': { name: 'Palace Gates', story: 'The regent’s golden guard defends the outer palace gates.' },
      's3-5': { name: 'Regent Kurogane', story: 'The regent wears an oni demon mask and commands shadow samurai and imps. Free the emperor.' },
      'v1-1': { name: 'Fishing Village', story: 'Hrafn’s men raided the fishermen. Drive them off.' },
      'v1-2': { name: 'Frozen Ford', story: 'Hrafn’s hunters guard the river ford.' },
      'v1-3': { name: 'Rune Stone', story: 'At the rune stone the victors swear loyalty. Then shieldbearers will join you.' },
      'v1-4': { name: 'Wolf Forest', story: 'Hrafn sent his berserkers. There will be blood in the wolf forest.' },
      'v1-5': { name: 'Hrafn’s Hall', story: 'Hrafn the Cruel waits in his hall. Whoever wins will rule the fjords.' },
      'v2-1': { name: 'Frozen Lake', story: 'The ice cracks underfoot. Advance carefully.' },
      'v2-2': { name: 'Snow Patrol', story: 'An ice guard patrol is already watching for you.' },
      'v2-3': { name: 'Crystal Gorge', story: 'A gorge full of crystals reflects every arrow.' },
      'v2-4': { name: 'Storm Heights', story: 'Wind and snow. The enemy holds the high ground.' },
      'v2-5': { name: 'Ice Gate', story: 'The commander of the ice guard defends the only gate into the heart of the wastes.' },
      'v3-1': { name: 'End of the World', story: 'At the edge of the known world stands the first ice fortress.' },
      'v3-2': { name: 'Rainbow Bridge', story: 'Under the northern lights the bridge between worlds trembles.' },
      'v3-3': { name: 'Ice Giants', story: 'The knights of the ice guard are as strong as giants from the sagas.' },
      'v3-4': { name: 'Stormy Sea', story: 'Across the frozen sea, demons join the ice guard.' },
      'v3-5': { name: 'Citadel of the Frost Crown', story: 'Defeat the Frost Crown and stop Ragnarök.' },
      'd1-1': { name: 'Scorched Plain', story: 'The first demons crawl from cracks in the earth. Try soldiers of all three nations at once.' },
      'd1-2': { name: 'Lava River', story: 'A single stone bridge crosses the river of lava. Spitters cover it with fire.' },
      'd1-3': { name: 'Bone Forest', story: 'A forest of bones and spikes. Turn on AUTO for a nation you want to fight on its own.' },
      'd1-4': { name: 'Imp Camp', story: 'Swarms of imps pour in from all sides.' },
      'd1-5': { name: 'Gate of Hell', story: 'A giant obsidian gate. Behind it begins Azgaroth’s realm.' },
      'd2-1': { name: 'Sulfur Springs', story: 'Poisonous fumes and boiling springs. Spitters attack from the rocks.' },
      'd2-2': { name: 'Chain Bridge', story: 'The bridge hangs on chains over a chasm full of fire.' },
      'd2-3': { name: 'Hall of the Damned', story: 'The damned knights once served the Lion Crown. Now they serve hell.' },
      'd2-4': { name: 'The Crater', story: 'The crater’s rim. Lava bubbles below you, Azgaroth’s whole legion stands before you.' },
      'd2-5': { name: 'Throne of the Demon King', story: 'The final battle. The giant hell fortress has three gates and demons pour out of all of them. Azgaroth himself enters the field. When he falls, his fortress will shake.' }
    },
    saga: { kralovstvi: 'Lion Crown', samurajove: 'Kazehana Clan', vikingove: 'Storm Fjord', spojenectvi: 'Alliance' },
    cast: { vypravec: 'Narrator', aldrik: 'King Aldric', rju: 'Daimyō Ryū', sigrun: 'Jarl Sigrun', azgaroth: 'Azgaroth' },
    scenes: {
      prolog: { title: 'Prologue', pages: ['A thousand years ago Azgaroth, the Demon King, descended from the Fire Mountain. Knights, samurai and Vikings defeated him together and sealed him with three seals.', 'Then the nations forgot their alliance. The seals are weakening and Azgaroth’s whisper turns rulers against each other again.', 'Marshal! Villages burn on the border and the Shadow Legion stirs in the mountains. Defend the kingdom before it is too late.'] },
      akt2: { title: 'Act II · Kazehana Clan', pages: ['Dark Lord Morvan did not serve himself. His seal bears the sign of the Demon King. The second seal is kept by the Kazehana clan in the east.', 'The marshal sails across the sea to the Land of the Rising Sun. Young daimyō Ryū welcomes him – but his land is torn by war.', 'We will help you, knights, once we unite the provinces. Regent Kurogane locked himself in the capital and since then he speaks with a voice that is not his own.'] },
      akt3: { title: 'Act III · Storm Fjord', pages: ['The regent wore an oni demon mask. The seal beneath the palace is broken. Only the last one remains – in the far north.', 'Knights and samurai sail to the Storm Fjord. Jarl Sigrun will accept them only if they help her defeat Hrafn the Cruel.', 'Hrafn swore loyalty to the Frost Crown. The skalds sing that it is Azgaroth’s herald. Axes up!'] },
      akt4: { title: 'Act IV · Alliance', pages: ['The Frost Crown has fallen, but the last seal cracked. Azgaroth is free.', 'The Lion Crown, the Kazehana clan and the Storm Fjord. Three nations, one army. We march to the Fire Mountain!', 'In alliance battles you send soldiers of all three nations at once. Each kingdom has its own AUTO switch – turn it on and its soldiers will march out on their own.'] },
      finale: { title: 'Throne of the Demon King', pages: ['Three nations… just like a thousand years ago. This time I will burn you all.', 'When the Demon King falls, his fortress will shake. Then strike all together!'] },
      epilog: { title: 'Epilogue', pages: ['Azgaroth has fallen and the Fire Mountain is silent. The three nations renewed the seal – this time a single, shared one that no quarrel can break.', 'The skalds will sing of this battle for a thousand years.', 'The alliance will last as long as we remember this day. Thank you, marshal.'] }
    },
    buildings: {
      hradby: { name: 'Walls', desc: 'Stronger walls = more castle health.' },
      pokladnice: { name: 'Treasury', desc: 'Faster coin income during battle.' },
      kasarna: { name: 'Barracks', desc: '+6% health and attack for all soldiers per level.' },
      vez: { name: 'Watchtower', desc: 'Archers on the tower shoot enemies at the gate.' },
      zbrojnice: { name: 'Armory', desc: 'Higher coin limit in battle.' }
    },
    unitSkins: {
      zakladni: { name: 'Team Armor', desc: 'The classic colors of your realm.' },
      lesni: { name: 'Forest Rangers', desc: 'Green cloaks and bronze fittings.' },
      stinovy: { name: 'Shadow Legion', desc: 'Black steel, red eyes and horned helmets.' },
      zlaty: { name: 'Golden Paladin', desc: 'White cloak and gilded armor.' },
      ledovy: { name: 'Ice Guard', desc: 'Crystal armor of eternal ice.' },
      pulnoc: { name: 'Midnight Watch', desc: 'Dark blue and silver.' },
      rudy_drak: { name: 'Red Dragon', desc: 'Crimson armor with a golden dragon.' },
      smaragd: { name: 'Emerald Warden', desc: 'Green fittings and glowing weapons.' }
    },
    castleSkins: {
      kralovsky: { name: 'Royal Castle', desc: 'Grey stone and roofs in your team color.' },
      pisecna: { name: 'Desert Fortress', desc: 'Sandstone and copper roofs.' },
      temna: { name: 'Dark Keep', desc: 'Basalt, red roofs and glowing purple windows.' },
      ledova: { name: 'Ice Citadel', desc: 'Glittering blue-white ice.' },
      mramor: { name: 'Marble Palace', desc: 'White marble and golden roofs.' }
    },
    decor: {
      pochodne: { name: 'Gate torches', desc: 'Two blazing torches light the gate.' },
      prapory: { name: 'Great banners', desc: 'Long banners with your emblem on the walls.' },
      stity: { name: 'Heraldic shields', desc: 'A row of shields with your emblem along the walls.' },
      zahrada: { name: 'Garden', desc: 'Bushes and flowers around the castle base.' },
      zlato: { name: 'Gilding', desc: 'Golden bands, gate trim and golden finials on the flagpoles.' }
    },
    emblems: { lilie: { name: 'Lily' }, lev: { name: 'Lion' }, orel: { name: 'Eagle' }, kriz: { name: 'Cross' }, slunce: { name: 'Sun' }, hvezda: { name: 'Star' }, sakura: { name: 'Sakura' }, havran: { name: 'Raven' }, sekery: { name: 'Axes' } }
  };

  window.I18N_EN.abilities = {
    ohen: { name: 'Fire Rain', desc: 'Fireballs fall on the nearest group of enemies.' },
    stit: { name: 'Shield of Faith', desc: 'Your soldiers take half damage for 6 seconds.' }
  };

  /* Přepne obsah hry (jména, popisy, příběhy) mezi češtinou a angličtinou */
  I18N.localizeData = function () {
    const EN = window.I18N_EN, cs = this.lang === 'cs';
    const apply = (obj, fields, en) => {
      if (!obj) return;
      if (!obj.__cs) { Object.defineProperty(obj, '__cs', { value: {}, enumerable: false }); fields.forEach(f => (obj.__cs[f] = obj[f])); }
      fields.forEach(f => { if (obj.__cs[f] === undefined) return; obj[f] = (cs || !en || en[f] == null) ? obj.__cs[f] : en[f]; });
    };
    Object.values(GameData.units).forEach(u => {
      apply(u, ['name', 'role', 'desc'], EN.units[u.id]);
      if (u.unlock) apply(u.unlock, ['text'], { text: 'Unlocks after level 1-3 of Act ' + ({ s: 'II', v: 'III' }[u.unlock.campaign[0]] || 'I') + '.' });
    });
    Object.values(GameData.factions).forEach(F => {
      apply(F, ['name', 'people', 'desc', 'strengths', 'prologue'], EN.factions[F.id]);
      F.organization.forEach((n, i) => {
        apply(n, ['title', 'sub', 'desc'], EN.org[F.id + ':' + i]);
        (n.children || []).forEach((c, ci) => apply(c, ['title', 'sub', 'desc'], EN.org[F.id + ':' + i + ':' + ci]));
      });
    });
    Object.keys(GameData.campaigns).forEach(f => GameData.campaigns[f].forEach(ch => {
      apply(ch, ['name', 'intro', 'outro'], EN.chapters[f + ':' + ch.id]);
      ch.levels.forEach(l => apply(l, ['name', 'story'], EN.levels[l.id]));
    }));
    GameData.buildings.forEach(b => apply(b, ['name', 'desc'], EN.buildings[b.id]));
    (GameData.saga || []).forEach(a => apply(a, ['name'], { name: EN.saga[a.id] }));
    Object.keys(GameData.cast || {}).forEach(k => apply(GameData.cast[k], ['name'], { name: EN.cast[k] }));
    Object.keys(GameData.scenes || {}).forEach(k => {
      const sc = GameData.scenes[k], e = EN.scenes[k] || {};
      apply(sc, ['title'], { title: e.title });
      sc.pages.forEach((pg, i) => apply(pg, ['text'], { text: (e.pages || [])[i] }));
    });
    GameData.unitSkins.forEach(s => apply(s, ['name', 'desc'], EN.unitSkins[s.id]));
    GameData.castleSkins.forEach(s => apply(s, ['name', 'desc'], EN.castleSkins[s.id]));
    GameData.castleCustom.decorations.forEach(d => apply(d, ['name', 'desc'], EN.decor[d.id]));
    GameData.castleCustom.emblems.forEach(e => apply(e, ['name'], EN.emblems[e.id]));
    Object.values(GameData.abilities).forEach(a => apply(a, ['name', 'desc'], EN.abilities[a.id]));
  };

  // Doplňkové krátké texty (všechny jazyky)
  Object.assign(I18N.D, {
    rar_0: ['Základní', 'Basic', '基础', 'साधारण', 'Básico', 'Basique', 'أساسي', 'সাধারণ', 'Básico', 'Обычный', 'بنیادی', 'Dasar', 'Basis', 'ベーシック', 'Temel', '기본'],
    rar_1: ['Vzácný', 'Rare', '稀有', 'दुर्लभ', 'Raro', 'Rare', 'نادر', 'দুর্লভ', 'Raro', 'Редкий', 'نایاب', 'Langka', 'Selten', 'レア', 'Nadir', '희귀'],
    rar_2: ['Epický', 'Epic', '史诗', 'महाकाव्य', 'Épico', 'Épique', 'ملحمي', 'মহাকাব্যিক', 'Épico', 'Эпический', 'شاندار', 'Epik', 'Episch', 'エピック', 'Destansı', '영웅'],
    rar_3: ['Legendární', 'Legendary', '传说', 'पौराणिक', 'Legendario', 'Légendaire', 'أسطوري', 'কিংবদন্তি', 'Lendário', 'Легендарный', 'افسانوی', 'Legendaris', 'Legendär', 'レジェンド', 'Efsanevi', '전설'],
    eff_hp: ['{n} životů hradu', '{n} castle health', '城堡生命 {n}', 'किले का जीवन {n}', '{n} de vida del castillo', '{n} PV du château', '{n} صحة القلعة', 'দুর্গের জীবন {n}', '{n} de vida do castelo', '{n} прочности замка', 'قلعے کی زندگی {n}', '{n} nyawa kastil', '{n} Burgleben', '城の体力 {n}', '{n} kale canı', '성 체력 {n}'],
    eff_income: ['{n} mincí/s', '{n} coins/s', '{n} 金币/秒', '{n} सिक्के/से', '{n} monedas/s', '{n} pièces/s', '{n} عملة/ث', '{n} মুদ্রা/সে', '{n} moedas/s', '{n} монет/с', '{n} سکے/سیکنڈ', '{n} koin/dtk', '{n} Münzen/s', '{n} コイン/秒', '{n} para/sn', '{n} 코인/초'],
    eff_power: ['+{n} % síla vojáků', '+{n}% soldier power', '士兵战力 +{n}%', 'सैनिक शक्ति +{n}%', '+{n} % de poder', '+{n} % de puissance', '+{n}% قوة الجنود', 'সৈন্যশক্তি +{n}%', '+{n}% de poder', '+{n}% к силе', '+{n}% طاقت', '+{n}% kekuatan', '+{n} % Stärke', '戦力 +{n}%', '+%{n} güç', '전투력 +{n}%'],
    eff_tower: ['{n} zranění/šíp', '{n} damage/arrow', '每箭伤害 {n}', '{n} क्षति/तीर', '{n} daño/flecha', '{n} dégâts/flèche', '{n} ضرر/سهم', '{n} ক্ষতি/তীর', '{n} dano/flecha', '{n} урона/стрела', '{n} نقصان/تیر', '{n} kerusakan/panah', '{n} Schaden/Pfeil', '矢1本 {n} ダメージ', '{n} hasar/ok', '화살당 피해 {n}'],
    eff_tower0: ['Věž je prázdná', 'Tower is empty', '箭塔无人', 'मीनार खाली', 'Torre vacía', 'Tour vide', 'البرج فارغ', 'মিনার খালি', 'Torre vazia', 'Башня пуста', 'مینار خالی', 'Menara kosong', 'Turm ist leer', '塔は空', 'Kule boş', '탑이 비어 있음'],
    eff_limit: ['Limit {n} mincí', 'Limit {n} coins', '上限 {n} 金币', 'सीमा {n} सिक्के', 'Límite {n} monedas', 'Limite {n} pièces', 'الحد {n} عملة', 'সীমা {n} মুদ্রা', 'Limite {n} moedas', 'Лимит {n} монет', 'حد {n} سکے', 'Batas {n} koin', 'Limit {n} Münzen', '上限 {n} コイン', 'Sınır {n} para', '한도 {n} 코인']
  });

  // Sága, spojenectví, AUTO a boss (všechny jazyky: cs,en,zh,hi,es,fr,ar,bn,pt,ru,ur,id,de,ja,tr,ko)
  Object.assign(I18N.D, {
    act_n: ['Akt {n}', 'Act {n}', '第{n}幕', 'अंक {n}', 'Acto {n}', 'Acte {n}', 'الفصل {n}', 'অঙ্ক {n}', 'Ato {n}', 'Акт {n}', 'ایکٹ {n}', 'Babak {n}', 'Akt {n}', '第{n}幕', 'Perde {n}', '{n}막'],
    alliance: ['Spojenectví', 'Alliance', '联盟', 'गठबंधन', 'Alianza', 'Alliance', 'التحالف', 'জোট', 'Aliança', 'Союз', 'اتحاد', 'Aliansi', 'Bündnis', '同盟', 'İttifak', '동맹'],
    alliance_note: ['Posíláš vojáky všech tří národů najednou. Každý národ má vlastní přepínač AUTO.', 'You send soldiers of all three nations at once. Each nation has its own AUTO switch.', '可同时派出三个国家的士兵，每个国家都有自己的自动开关。', 'तीनों राष्ट्रों के सैनिक एक साथ भेजो। हर राष्ट्र का अपना AUTO स्विच है।', 'Envías soldados de las tres naciones a la vez. Cada nación tiene su interruptor AUTO.', 'Tu envoies les soldats des trois nations à la fois. Chaque nation a son interrupteur AUTO.', 'ترسل جنود الأمم الثلاث معًا. لكل أمة مفتاح AUTO خاص بها.', 'তিন জাতির সৈন্য একসাথে পাঠাও। প্রতিটি জাতির নিজস্ব AUTO সুইচ আছে।', 'Você envia soldados das três nações ao mesmo tempo. Cada nação tem seu botão AUTO.', 'Ты посылаешь воинов всех трёх народов сразу. У каждого народа свой переключатель AUTO.', 'تینوں قوموں کے سپاہی ایک ساتھ بھیجیں۔ ہر قوم کا اپنا AUTO سوئچ ہے۔', 'Kirim prajurit ketiga bangsa sekaligus. Tiap bangsa punya sakelar AUTO sendiri.', 'Du schickst Soldaten aller drei Völker zugleich. Jedes Volk hat seinen eigenen AUTO-Schalter.', '3つの国の兵を同時に送れる。国ごとにAUTOスイッチがある。', 'Üç ulusun askerlerini aynı anda gönderirsin. Her ulusun kendi AUTO düğmesi var.', '세 나라의 병사를 동시에 보냅니다. 나라마다 AUTO 스위치가 있습니다.'],
    you_play: ['Hraješ za', 'You play as', '你的阵营', 'तुम खेलते हो', 'Juegas con', 'Tu joues', 'تلعب بـ', 'তুমি খেলছ', 'Você joga com', 'Ты играешь за', 'آپ کھیلتے ہیں', 'Kamu bermain', 'Du spielst', 'プレイ勢力', 'Oynadığın', '플레이 진영'],
    auto_for: ['Automatické vysílání: {name}', 'Auto deploy: {name}', '自动出兵：{name}', 'स्वचालित भेजना: {name}', 'Envío automático: {name}', 'Envoi auto : {name}', 'إرسال تلقائي: {name}', 'স্বয়ংক্রিয় পাঠানো: {name}', 'Envio automático: {name}', 'Автовысылка: {name}', 'خودکار بھیجنا: {name}', 'Kirim otomatis: {name}', 'Auto-Entsendung: {name}', '自動出撃：{name}', 'Otomatik gönderim: {name}', '자동 파병: {name}'],
    t_auto_on: ['AUTO zapnuto: {name}', 'AUTO on: {name}', '自动已开启：{name}', 'AUTO चालू: {name}', 'AUTO activado: {name}', 'AUTO activé : {name}', 'تم تشغيل AUTO: {name}', 'AUTO চালু: {name}', 'AUTO ligado: {name}', 'AUTO включено: {name}', 'AUTO آن: {name}', 'AUTO aktif: {name}', 'AUTO an: {name}', 'AUTO オン：{name}', 'AUTO açık: {name}', 'AUTO 켜짐: {name}'],
    t_auto_off: ['AUTO vypnuto: {name}', 'AUTO off: {name}', '自动已关闭：{name}', 'AUTO बंद: {name}', 'AUTO desactivado: {name}', 'AUTO désactivé : {name}', 'تم إيقاف AUTO: {name}', 'AUTO বন্ধ: {name}', 'AUTO desligado: {name}', 'AUTO выключено: {name}', 'AUTO آف: {name}', 'AUTO nonaktif: {name}', 'AUTO aus: {name}', 'AUTO オフ：{name}', 'AUTO kapalı: {name}', 'AUTO 꺼짐: {name}'],
    boss_enters: ['{name} vstupuje do bitvy!', '{name} enters the battle!', '{name}加入战斗！', '{name} युद्ध में उतरा!', '¡{name} entra en la batalla!', '{name} entre dans la bataille !', '{name} يدخل المعركة!', '{name} যুদ্ধে নামল!', '{name} entra na batalha!', '{name} вступает в бой!', '{name} جنگ میں داخل!', '{name} memasuki pertempuran!', '{name} betritt das Schlachtfeld!', '{name}が参戦！', '{name} savaşa giriyor!', '{name} 참전!'],
    boss_fell: ['{name} padl! Pevnost se otřásá!', '{name} has fallen! The fortress shakes!', '{name}倒下了！要塞在震动！', '{name} गिर गया! किला काँप रहा है!', '¡{name} ha caído! ¡La fortaleza tiembla!', '{name} est tombé ! La forteresse tremble !', 'سقط {name}! الحصن يهتز!', '{name} পড়ে গেছে! দুর্গ কাঁপছে!', '{name} caiu! A fortaleza treme!', '{name} пал! Крепость содрогается!', '{name} گر گیا! قلعہ لرز رہا ہے!', '{name} tumbang! Benteng berguncang!', '{name} ist gefallen! Die Festung bebt!', '{name}が倒れた！要塞が揺れる！', '{name} düştü! Kale sarsılıyor!', '{name} 쓰러졌다! 요새가 흔들린다!'],
    act_done: ['Akt {n} dokončen!', 'Act {n} complete!', '第{n}幕完成！', 'अंक {n} पूरा!', '¡Acto {n} completado!', 'Acte {n} terminé !', 'اكتمل الفصل {n}!', 'অঙ্ক {n} শেষ!', 'Ato {n} concluído!', 'Акт {n} пройден!', 'ایکٹ {n} مکمل!', 'Babak {n} selesai!', 'Akt {n} abgeschlossen!', '第{n}幕クリア！', 'Perde {n} tamamlandı!', '{n}막 완료!'],
    act_unlocked: ['Odemčen Akt {n}: {name}.', 'Act {n} unlocked: {name}.', '已解锁第{n}幕：{name}。', 'अंक {n} खुला: {name}।', 'Acto {n} desbloqueado: {name}.', 'Acte {n} débloqué : {name}.', 'تم فتح الفصل {n}: {name}.', 'অঙ্ক {n} খুলেছে: {name}।', 'Ato {n} desbloqueado: {name}.', 'Открыт акт {n}: {name}.', 'ایکٹ {n} کھل گیا: {name}۔', 'Babak {n} terbuka: {name}.', 'Akt {n} freigeschaltet: {name}.', '第{n}幕解放：{name}', 'Perde {n} açıldı: {name}.', '{n}막 해금: {name}.'],
    saga_progress: ['Sága: {a} / {b}', 'Saga: {a} / {b}', '传奇：{a} / {b}', 'गाथा: {a} / {b}', 'Saga: {a} / {b}', 'Saga : {a} / {b}', 'الملحمة: {a} / {b}', 'গাথা: {a} / {b}', 'Saga: {a} / {b}', 'Сага: {a} / {b}', 'داستان: {a} / {b}', 'Saga: {a} / {b}', 'Saga: {a} / {b}', 'サーガ：{a} / {b}', 'Destan: {a} / {b}', '사가: {a} / {b}'],
    replay_scene: ['Přehrát scénu', 'Replay scene', '重播剧情', 'दृश्य फिर देखें', 'Ver escena', 'Revoir la scène', 'إعادة المشهد', 'দৃশ্য আবার দেখো', 'Rever cena', 'Повторить сцену', 'منظر دوبارہ', 'Putar ulang adegan', 'Szene ansehen', 'シーンを再生', 'Sahneyi izle', '장면 다시 보기'],
    saga_help: ['Příběh je jedna sága: nejdřív Království, potom Samurajové, Vikingové a nakonec spojenectví všech tří národů proti Démonickému králi. Další akt se odemkne po dokončení předchozího.', 'The story is one saga: first the Kingdom, then the Samurai, the Vikings and finally the alliance of all three nations against the Demon King. Each act unlocks after the previous one.', '故事是一部传奇：先是王国，然后是武士、维京人，最后三国联盟对抗恶魔之王。完成上一幕后解锁下一幕。', 'कहानी एक गाथा है: पहले राज्य, फिर समुराई, वाइकिंग और अंत में तीनों का गठबंधन दानव राजा के विरुद्ध। हर अंक पिछले के बाद खुलता है।', 'La historia es una saga: primero el Reino, luego los Samuráis, los Vikingos y al final la alianza de las tres naciones contra el Rey Demonio. Cada acto se abre tras el anterior.', 'L’histoire est une seule saga : d’abord le Royaume, puis les Samouraïs, les Vikings et enfin l’alliance des trois nations contre le Roi Démon. Chaque acte s’ouvre après le précédent.', 'القصة ملحمة واحدة: أولًا المملكة ثم الساموراي ثم الفايكنغ، وأخيرًا تحالف الأمم الثلاث ضد ملك الشياطين. يُفتح كل فصل بعد السابق.', 'গল্পটি একটি গাথা: প্রথমে রাজ্য, তারপর সামুরাই, ভাইকিং, শেষে তিন জাতির জোট দানব রাজার বিরুদ্ধে। প্রতিটি অঙ্ক আগেরটির পরে খোলে।', 'A história é uma saga: primeiro o Reino, depois os Samurais, os Vikings e por fim a aliança das três nações contra o Rei Demônio. Cada ato abre após o anterior.', 'Сюжет — одна сага: сначала Королевство, затем Самураи, Викинги и наконец союз трёх народов против Короля демонов. Каждый акт открывается после предыдущего.', 'کہانی ایک داستان ہے: پہلے سلطنت، پھر سامورائی، وائکنگ اور آخر میں تینوں کا اتحاد شیطانی بادشاہ کے خلاف۔ ہر ایکٹ پچھلے کے بعد کھلتا ہے۔', 'Ceritanya satu saga: Kerajaan dulu, lalu Samurai, Viking, dan akhirnya aliansi tiga bangsa melawan Raja Iblis. Tiap babak terbuka setelah yang sebelumnya.', 'Die Geschichte ist eine Saga: erst das Königreich, dann die Samurai, die Wikinger und schließlich das Bündnis aller drei Völker gegen den Dämonenkönig. Jeder Akt öffnet sich nach dem vorigen.', '物語はひとつのサーガ：王国、侍、ヴァイキング、そして三国同盟で魔王に挑む。前の幕をクリアすると次が開く。', 'Hikaye tek bir destan: önce Krallık, sonra Samuraylar, Vikingler ve en sonunda üç ulusun İblis Kral’a karşı ittifakı. Her perde bir öncekinden sonra açılır.', '이야기는 하나의 사가입니다: 왕국, 사무라이, 바이킹, 마지막으로 세 나라의 동맹이 마왕에 맞섭니다. 이전 막을 끝내면 다음 막이 열립니다.'],
    nation_locked: ['Odemkne se v Aktu {n}', 'Unlocks in Act {n}', '第{n}幕解锁', 'अंक {n} में खुलेगा', 'Se abre en el Acto {n}', 'S’ouvre à l’Acte {n}', 'يُفتح في الفصل {n}', 'অঙ্ক {n}-এ খুলবে', 'Abre no Ato {n}', 'Откроется в акте {n}', 'ایکٹ {n} میں کھلے گا', 'Terbuka di Babak {n}', 'Ab Akt {n}', '第{n}幕で解放', 'Perde {n}’te açılır', '{n}막에서 해금'],
    t_nation_locked: ['Tento národ odemkneš v příběhu.', 'You unlock this nation in the story.', '在故事中解锁此国家。', 'यह राष्ट्र कहानी में खुलेगा।', 'Desbloqueas esta nación en la historia.', 'Tu débloques cette nation dans l’histoire.', 'تفتح هذه الأمة في القصة.', 'এই জাতি গল্পে খুলবে।', 'Você desbloqueia esta nação na história.', 'Этот народ откроется по сюжету.', 'یہ قوم کہانی میں کھلے گی۔', 'Bangsa ini terbuka lewat cerita.', 'Dieses Volk schaltest du in der Geschichte frei.', 'この国はストーリーで解放されます。', 'Bu ulusu hikâyede açarsın.', '이 나라는 스토리에서 해금됩니다.']
  });

  Object.assign(I18N.D, {
    saga_title: ['Sága tří národů', 'Saga of Three Nations', '三国传奇', 'तीन राष्ट्रों की गाथा', 'Saga de tres naciones', 'Saga des trois nations', 'ملحمة الأمم الثلاث', 'তিন জাতির গাথা', 'Saga das três nações', 'Сага трёх народов', 'تین قوموں کی داستان', 'Saga Tiga Bangsa', 'Saga der drei Völker', '三国のサーガ', 'Üç Ulusun Destanı', '세 나라의 사가'],
    saga_sub: ['Rytíři → Samurajové → Vikingové → Démonický král', 'Knights → Samurai → Vikings → Demon King', '骑士 → 武士 → 维京人 → 恶魔之王', 'शूरवीर → समुराई → वाइकिंग → दानव राजा', 'Caballeros → Samuráis → Vikingos → Rey Demonio', 'Chevaliers → Samouraïs → Vikings → Roi Démon', 'الفرسان ← الساموراي ← الفايكنغ ← ملك الشياطين', 'নাইট → সামুরাই → ভাইকিং → দানব রাজা', 'Cavaleiros → Samurais → Vikings → Rei Demônio', 'Рыцари → Самураи → Викинги → Король демонов', 'شہسوار ← سامورائی ← وائکنگ ← شیطانی بادشاہ', 'Ksatria → Samurai → Viking → Raja Iblis', 'Ritter → Samurai → Wikinger → Dämonenkönig', '騎士 → 侍 → ヴァイキング → 魔王', 'Şövalyeler → Samuraylar → Vikingler → İblis Kral', '기사 → 사무라이 → 바이킹 → 마왕'],
    saga_finale: ['Démonický král', 'Demon King', '恶魔之王', 'दानव राजा', 'Rey Demonio', 'Roi Démon', 'ملك الشياطين', 'দানব রাজা', 'Rei Demônio', 'Король демонов', 'شیطانی بادشاہ', 'Raja Iblis', 'Dämonenkönig', '魔王', 'İblis Kral', '마왕'],
    saga_done: ['Hotovo', 'Done', '已完成', 'पूरा', 'Hecho', 'Terminé', 'تم', 'শেষ', 'Feito', 'Пройдено', 'مکمل', 'Selesai', 'Fertig', 'クリア', 'Bitti', '완료'],
    saga_now: ['▶ Právě hraješ', '▶ Playing now', '▶ 进行中', '▶ अभी खेल रहे हो', '▶ Jugando', '▶ En cours', '▶ تلعب الآن', '▶ এখন খেলছ', '▶ Jogando', '▶ Сейчас', '▶ ابھی کھیل رہے ہیں', '▶ Sedang dimainkan', '▶ Aktuell', '▶ プレイ中', '▶ Şu an', '▶ 진행 중'],
    saga_locked: ['Zamčeno', 'Locked', '未解锁', 'बंद', 'Bloqueado', 'Verrouillé', 'مقفل', 'বন্ধ', 'Bloqueado', 'Закрыто', 'بند', 'Terkunci', 'Gesperrt', 'ロック中', 'Kilitli', '잠김']
  });
})();
