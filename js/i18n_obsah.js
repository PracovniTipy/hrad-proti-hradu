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
      demonkral: U('Hell General', 'General of the Hell Legions', 'Azgaroth, the Hell General. Huge – his flaming sword hits up to five enemies at once.'),
      berserk: U('Berserker', 'Raging warrior', 'Fights in a bear pelt with a Dane axe. No armor, but below half health he enters a rage (+60% attack).')
    },
    factions: {
      kralovstvi: { name: 'Kingdom', people: 'Knights of the Lion Crown', desc: 'Heavily armored knights, disciplined infantry and stone castles.', strengths: 'Best armor, strong knights.', prologue: 'The Kingdom of the Lion Crown lived in peace for years. Now villages burn on the border, raiders sail in from the north and the Shadow Legion awakens in the mountains. As the king’s marshal you must defend the realm.' },
      samurajove: { name: 'Samurai', people: 'Kazehana Clan', desc: 'Swift sword masters, ashigaru with yari spears and bows with the longest range.', strengths: 'Longest range, fast units, powerful first strike.', prologue: 'The Land of the Rising Sun is divided. The Akabane clan burns the rice fields of Kiri province and Regent Kurogane craves the shogun’s power. As the young daimyō of the Kazehana clan you must unite the provinces and protect the emperor.' },
      demoni: { name: 'Demons', people: 'Legion of the Hell General', desc: 'Imps, fire spitters and damned knights from the Fire Mountain.', strengths: 'Fast imps, fireballs, tough hell knights.', prologue: 'A thousand years ago three nations sealed the Hell General Azgaroth beneath the Fire Mountain. The seal is weakening.' },
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
      'kralovstvi:2': { name: 'Dark Mountains', intro: 'In the mountains the Shadow Legion of the traitor Duke Morvan awakens.', outro: 'Morvan has fallen. In his keep you found letters sealed with a horned crown – the sign of the Hell General. The Legion marches on the capital!' },
      'kralovstvi:3': { name: 'The Besieged Crown', intro: 'The remains of the Shadow Legion and the first imps from hell besiege King Aldric’s capital.', outro: 'The demons vanished in fire, but their leader cried out a name: Azgaroth. The king sends you east to the Kazehana clan, keepers of the second seal.' },
      'samurajove:1': { name: 'Kiri Province', intro: 'The red wings of the Akabane clan plunder the misty Kiri valley. The Lion Crown’s marshal fights beside young daimyō Ryū.', outro: 'Lord Akabane surrendered. He says Regent Kurogane drove him to war – and that the regent speaks with fire at night.' },
      'samurajove:2': { name: 'Kurama Mountains', intro: 'Akabane remnants, mountain monks and the regent’s brother hide in the high peaks.', outro: 'General Kurogane died saying: “My brother is no longer human.” The road to the capital is open.' },
      'samurajove:3': { name: 'Road to the Capital', intro: 'Regent Kurogane holds the emperor captive and the second seal weakens beneath the palace.', outro: 'An oni demon mask fell from the regent’s face. The emperor is free and the Kazehana clan swears loyalty to the alliance. The last seal lies in the far north.' },
      'vikingove:1': { name: 'Home Fjords', intro: 'Jarl Hrafn the Cruel swore loyalty to the Frost Crown and conquers the fjords. Jarl Sigrun needs your help.', outro: 'Hrafn has fallen. His black rune crumbled to ash and the wind carried it north, to the Frozen Wastes.' },
      'vikingove:2': { name: 'Frozen Wastes', intro: 'Beyond the fjords lie the Frozen Wastes, guarded by the ice guard – fallen knights of an ancient crusade, raised by frost.', outro: 'The Ice Gate has fallen. Beyond it rises the citadel of the Frost Crown under a burning red sky.' },
      'vikingove:3': { name: 'Ragnarök', intro: 'The Frost Crown, Azgaroth’s herald, is breaking the last seal. The twilight of the gods begins.', outro: 'The Frost Crown shattered. For the first time in a thousand years three nations stand together – but the last seal has cracked.' },
      'spojenectvi:1': { name: 'Gate of Hell', intro: 'The united armies of three nations march across the scorched plains to the Fire Mountain.', outro: 'The Gate of Hell is taken. Azgaroth waits at the summit of the Fire Mountain.' },
      'spojenectvi:2': { name: 'Fire Mountain', intro: 'The last climb to the Hell General’s throne.', outro: 'Azgaroth has fallen. The Fire Mountain is silent.' }
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
      'd2-5': { name: 'Throne of the Hell General', story: 'The final battle. The giant hell fortress has three gates and demons pour out of all of them. Azgaroth himself enters the field. When he falls, his fortress will shake.' }
    },
    saga: { kralovstvi: 'Lion Crown', samurajove: 'Kazehana Clan', vikingove: 'Storm Fjord', spojenectvi: 'Alliance', risedemonu: 'Demon Realm' },
    cast: { vypravec: 'Narrator', aldrik: 'King Aldric', kancler: 'Chancellor Edmund', rju: 'Shōgun Ryū', sigrun: 'Queen Sigrun', azgaroth: 'Azgaroth', malakor: 'Malakor' },
    scenes: {
      prolog: { title: 'Prologue', pages: ['A thousand years ago Azgaroth, the Hell General, descended from the Fire Mountain. Knights, samurai and Vikings defeated him together and sealed him with three seals.', 'Then the nations forgot their alliance. The seals are weakening and Azgaroth’s whisper turns rulers against each other again.', 'Marshal! Villages burn on the border and the Shadow Legion stirs in the mountains. Defend the kingdom before it is too late.'] },
      akt2: { title: 'Act II · Kazehana Clan', pages: ['Dark Lord Morvan did not serve himself. His seal bears the sign of the Hell General. The second seal is kept by the Kazehana clan in the east.', 'The marshal sails across the sea to the Land of the Rising Sun. Young daimyō Ryū welcomes him – but his land is torn by war.', 'We will help you, knights, once we unite the provinces. Regent Kurogane locked himself in the capital and since then he speaks with a voice that is not his own.'] },
      akt3: { title: 'Act III · Storm Fjord', pages: ['The regent wore an oni demon mask. The seal beneath the palace is broken. Only the last one remains – in the far north.', 'Knights and samurai sail to the Storm Fjord. Jarl Sigrun will accept them only if they help her defeat Hrafn the Cruel.', 'Hrafn swore loyalty to the Frost Crown. The skalds sing that it is Azgaroth’s herald. Axes up!'] },
      akt4: { title: 'Act IV · Alliance', pages: ['The Frost Crown has fallen, but the last seal cracked. Azgaroth is free.', 'The Lion Crown, the Kazehana clan and the Storm Fjord. Three nations, one army. We march to the Fire Mountain!', 'In alliance battles you send soldiers of all three nations at once. Each kingdom has its own AUTO switch – turn it on and its soldiers will march out on their own.'] },
      finale: { title: 'Throne of the Hell General', pages: ['Three nations… just like a thousand years ago. This time I will burn you all.', 'When the Hell General falls, his fortress will shake. Then strike all together!'] },
      epilog: { title: 'Epilogue', pages: ['Azgaroth has fallen and the Fire Mountain is silent. The three nations renewed the seal – this time a single, shared one that no quarrel can break.', 'The skalds will sing of this battle for a thousand years.', 'The alliance will last as long as we remember this day. Thank you, marshal.', 'Fools… I was only one of the generals of hell. My brothers already hold your lands – and your people.', 'The demons have seized land after land and dragged away captives. The united nations set out to free the realm territory by territory, defeat the hell generals and rescue the hostages. To be continued…'] }
    },
    buildings: {
      hradby: { name: 'Walls', desc: 'Stronger walls = more castle health.' },
      pokladnice: { name: 'Treasury', desc: 'Faster coin income during battle.' },
      kasarna: { name: 'Barracks', desc: '+6% health and attack for all soldiers per level.' },
      vez: { name: 'Watchtower', desc: 'Archers on the tower shoot enemies at the gate.' },
      zbrojnice: { name: 'Armory', desc: 'More coins at the start of every battle.' }
    },
    unitSkins: {
      zakladni: { name: 'Team Armor', desc: 'The classic colors of your realm.' },
      lesni: { name: 'Forest Rangers', desc: 'Green cloaks and bronze fittings.' },
      stinovy: { name: 'Shadow Legion', desc: 'Black steel, red eyes and horned helmets.' },
      verny: { name: 'Loyal Guardian', desc: 'Reward for 14 days in a row. Cannot be bought.' },
      krvavy: { name: 'Blood Moon', desc: 'Red-black armor under a blood moon.' },
      nebesky: { name: 'Celestial Guardian', desc: 'White gold and glowing wings on the helm.' },
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
      apply(ch, ['name', 'intro', 'outro'], ch.en || EN.chapters[f + ':' + ch.id]);
      ch.levels.forEach(l => apply(l, ['name', 'story'], l.en || EN.levels[l.id]));
    }));
    GameData.buildings.forEach(b => apply(b, ['name', 'desc'], EN.buildings[b.id]));
    const GEN = { 'weapon:0': ['Tempered Steel', 'Better tempered blade and point.'], 'weapon:1': ['Rune Weapon', 'Runes on the blade glow blue.'], 'weapon:2': ['Dragonfire', 'Forged in dragon fire. Burns orange.'], 'weapon:3': ['Starsteel', 'Legendary weapon from a fallen star. Shines gold.'],
      'armor:0': ['Mail Vest', 'Sturdy chainmail under the tunic.'], 'armor:1': ['Steel Armor', 'Polished steel with blue trim.'], 'armor:2': ['Shadow Armor', 'Black steel with spiked pauldrons, a torn cloak and a horned helm.'], 'armor:3': ['King’s Armor', 'Gilded plate, ruby pauldrons, a crimson ermine cloak, a golden lion on the chest and a white-gold plume.'] };
    (GameData.gear || []).forEach(g => { const e = GEN[g.slot + ':' + g.tier]; apply(g, ['name', 'desc'], e && { name: e[0], desc: e[1] }); });
    const OEN = { pevnost: ['Great Fortress', 'A bigger castle with a keep: up to 10 defenders on the walls (at max Watchtower), +25% castle health.'], start: ['Starter Pack', 'Best start: gold, gems and a better infantry weapon.'], mesec: ['Bag of Gold', 'Gold for castle upgrades.'], hrst: ['Handful of Gems', 'Gems for skins and gear.'], kovar: ['Blacksmith Pack', 'A random rare or better weapon plus gold.'], zbrojir: ['Armorer Pack', 'Steel armor for the heavy unit plus gold.'], lucist: ['Archer Pack', 'Rune weapon for archers plus gems.'], valecny: ['War Pack', 'Gold and gems for the next campaign.'], hraniceri: ['Ranger Pack', 'Two soldier skins: Forest Rangers and Midnight Watch.'], hradni: ['Castle Pack', 'Torches and great banners for your castle plus gold.'], kopinik: ['Spearman Pack', 'Steel armor and a rune weapon for spearmen.'], hrdina: ['Hero Pack', 'Dragonfire for the heavy unit plus gems.'], kral: ['Royal Pack', 'King’s Armor for the heavy unit, 5,000 gold and 400 gems.'] };
    (GameData.offers || []).forEach(o => apply(o, ['name', 'desc'], OEN[o.id] && { name: OEN[o.id][0], desc: OEN[o.id][1] }));
    if (GameData.chests) { apply(GameData.chests.denni, ['name'], { name: 'Daily Chest' }); apply(GameData.chests.tydenni, ['name'], { name: 'Weekly Chest' }); }
    (GameData.saga || []).forEach(a => apply(a, ['name'], { name: EN.saga[a.id] }));
    Object.keys(GameData.cast || {}).forEach(k => apply(GameData.cast[k], ['name'], { name: EN.cast[k] }));
    Object.keys(GameData.scenes || {}).forEach(k => {
      const sc = GameData.scenes[k], e = (GameData.scenesEn || {})[k] || EN.scenes[k] || {};
      apply(sc, ['title'], { title: e.title });
      sc.pages.forEach((pg, i) => apply(pg, ['text'], { text: (e.pages || [])[i] }));
    });
    GameData.unitSkins.forEach(s => apply(s, ['name', 'desc'], EN.unitSkins[s.id] || s.en));
    (GameData.weaponSkins || []).forEach(s => apply(s, ['name', 'desc'], s.en));
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
    eff_limit: ['Na začátku boje {n} mincí', 'Start battles with {n} coins', '战斗开始时 {n} 金币', 'युद्ध की शुरुआत में {n} सिक्के', 'Empiezas con {n} monedas', 'Début de combat : {n} pièces', 'تبدأ المعركة بـ{n} عملة', 'যুদ্ধের শুরুতে {n} মুদ্রা', 'Começa com {n} moedas', 'В начале боя {n} монет', 'جنگ کے آغاز میں {n} سکے', 'Mulai perang dengan {n} koin', 'Kampfbeginn mit {n} Münzen', '開戦時 {n} コイン', 'Savaş başında {n} altın', '전투 시작 시 {n} 코인'],
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
    saga_help: ['Příběh je jedna sága: nejdřív Království, potom Samurajové, Vikingové a nakonec spojenectví všech tří národů proti Pekelnému generálovi. Další akt se odemkne po dokončení předchozího.', 'The story is one saga: first the Kingdom, then the Samurai, the Vikings and finally the alliance of all three nations against the Hell General. Each act unlocks after the previous one.', '故事是一部传奇：先是王国，然后是武士、维京人，最后三国联盟对抗地狱将军。完成上一幕后解锁下一幕。', 'कहानी एक गाथा है: पहले राज्य, फिर समुराई, वाइकिंग और अंत में तीनों का गठबंधन नरक का सेनापति के विरुद्ध। हर अंक पिछले के बाद खुलता है।', 'La historia es una saga: primero el Reino, luego los Samuráis, los Vikingos y al final la alianza de las tres naciones contra el General del Infierno. Cada acto se abre tras el anterior.', 'L’histoire est une seule saga : d’abord le Royaume, puis les Samouraïs, les Vikings et enfin l’alliance des trois nations contre le Général des Enfers. Chaque acte s’ouvre après le précédent.', 'القصة ملحمة واحدة: أولًا المملكة ثم الساموراي ثم الفايكنغ، وأخيرًا تحالف الأمم الثلاث ضد جنرال الجحيم. يُفتح كل فصل بعد السابق.', 'গল্পটি একটি গাথা: প্রথমে রাজ্য, তারপর সামুরাই, ভাইকিং, শেষে তিন জাতির জোট নরকের সেনাপতির বিরুদ্ধে। প্রতিটি অঙ্ক আগেরটির পরে খোলে।', 'A história é uma saga: primeiro o Reino, depois os Samurais, os Vikings e por fim a aliança das três nações contra o General do Inferno. Cada ato abre após o anterior.', 'Сюжет — одна сага: сначала Королевство, затем Самураи, Викинги и наконец союз трёх народов против Генерала преисподней. Каждый акт открывается после предыдущего.', 'کہانی ایک داستان ہے: پہلے سلطنت، پھر سامورائی، وائکنگ اور آخر میں تینوں کا اتحاد جہنم کا جرنیل کے خلاف۔ ہر ایکٹ پچھلے کے بعد کھلتا ہے۔', 'Ceritanya satu saga: Kerajaan dulu, lalu Samurai, Viking, dan akhirnya aliansi tiga bangsa melawan Jenderal Neraka. Tiap babak terbuka setelah yang sebelumnya.', 'Die Geschichte ist eine Saga: erst das Königreich, dann die Samurai, die Wikinger und schließlich das Bündnis aller drei Völker gegen den Höllengeneral. Jeder Akt öffnet sich nach dem vorigen.', '物語はひとつのサーガ：王国、侍、ヴァイキング、そして三国同盟で地獄の将軍に挑む。前の幕をクリアすると次が開く。', 'Hikaye tek bir destan: önce Krallık, sonra Samuraylar, Vikingler ve en sonunda üç ulusun Cehennem Generali’ne karşı ittifakı. Her perde bir öncekinden sonra açılır.', '이야기는 하나의 사가입니다: 왕국, 사무라이, 바이킹, 마지막으로 세 나라의 동맹이 지옥의 장군에 맞섭니다. 이전 막을 끝내면 다음 막이 열립니다.'],
    nation_locked: ['Odemkne se v Aktu {n}', 'Unlocks in Act {n}', '第{n}幕解锁', 'अंक {n} में खुलेगा', 'Se abre en el Acto {n}', 'S’ouvre à l’Acte {n}', 'يُفتح في الفصل {n}', 'অঙ্ক {n}-এ খুলবে', 'Abre no Ato {n}', 'Откроется в акте {n}', 'ایکٹ {n} میں کھلے گا', 'Terbuka di Babak {n}', 'Ab Akt {n}', '第{n}幕で解放', 'Perde {n}’te açılır', '{n}막에서 해금'],
    t_nation_locked: ['Tento národ odemkneš v příběhu.', 'You unlock this nation in the story.', '在故事中解锁此国家。', 'यह राष्ट्र कहानी में खुलेगा।', 'Desbloqueas esta nación en la historia.', 'Tu débloques cette nation dans l’histoire.', 'تفتح هذه الأمة في القصة.', 'এই জাতি গল্পে খুলবে।', 'Você desbloqueia esta nação na história.', 'Этот народ откроется по сюжету.', 'یہ قوم کہانی میں کھلے گی۔', 'Bangsa ini terbuka lewat cerita.', 'Dieses Volk schaltest du in der Geschichte frei.', 'この国はストーリーで解放されます。', 'Bu ulusu hikâyede açarsın.', '이 나라는 스토리에서 해금됩니다.']
  });

  Object.assign(I18N.D, {
    saga_title: ['Sága tří národů', 'Saga of Three Nations', '三国传奇', 'तीन राष्ट्रों की गाथा', 'Saga de tres naciones', 'Saga des trois nations', 'ملحمة الأمم الثلاث', 'তিন জাতির গাথা', 'Saga das três nações', 'Сага трёх народов', 'تین قوموں کی داستان', 'Saga Tiga Bangsa', 'Saga der drei Völker', '三国のサーガ', 'Üç Ulusun Destanı', '세 나라의 사가'],
    saga_sub: ['Rytíři → Samurajové → Vikingové → Pekelný generál', 'Knights → Samurai → Vikings → Hell General', '骑士 → 武士 → 维京人 → 地狱将军', 'शूरवीर → समुराई → वाइकिंग → नरक का सेनापति', 'Caballeros → Samuráis → Vikingos → General del Infierno', 'Chevaliers → Samouraïs → Vikings → Général des Enfers', 'الفرسان ← الساموراي ← الفايكنغ ← جنرال الجحيم', 'নাইট → সামুরাই → ভাইকিং → নরকের সেনাপতি', 'Cavaleiros → Samurais → Vikings → General do Inferno', 'Рыцари → Самураи → Викинги → Генерал преисподней', 'شہسوار ← سامورائی ← وائکنگ ← جہنم کا جرنیل', 'Ksatria → Samurai → Viking → Jenderal Neraka', 'Ritter → Samurai → Wikinger → Höllengeneral', '騎士 → 侍 → ヴァイキング → 地獄の将軍', 'Şövalyeler → Samuraylar → Vikingler → Cehennem Generali', '기사 → 사무라이 → 바이킹 → 지옥의 장군'],
    saga_finale: ['Pekelný generál', 'Hell General', '地狱将军', 'नरक का सेनापति', 'General del Infierno', 'Général des Enfers', 'جنرال الجحيم', 'নরকের সেনাপতি', 'General do Inferno', 'Генерал преисподней', 'جہنم کا جرنیل', 'Jenderal Neraka', 'Höllengeneral', '地獄の将軍', 'Cehennem Generali', '지옥의 장군'],
    saga_done: ['Hotovo', 'Done', '已完成', 'पूरा', 'Hecho', 'Terminé', 'تم', 'শেষ', 'Feito', 'Пройдено', 'مکمل', 'Selesai', 'Fertig', 'クリア', 'Bitti', '완료'],
    saga_now: ['▶ Právě hraješ', '▶ Playing now', '▶ 进行中', '▶ अभी खेल रहे हो', '▶ Jugando', '▶ En cours', '▶ تلعب الآن', '▶ এখন খেলছ', '▶ Jogando', '▶ Сейчас', '▶ ابھی کھیل رہے ہیں', '▶ Sedang dimainkan', '▶ Aktuell', '▶ プレイ中', '▶ Şu an', '▶ 진행 중'],
    saga_locked: ['Zamčeno', 'Locked', '未解锁', 'बंद', 'Bloqueado', 'Verrouillé', 'مقفل', 'বন্ধ', 'Bloqueado', 'Закрыто', 'بند', 'Terkunci', 'Gesperrt', 'ロック中', 'Kilitli', '잠김']
  });
  // Obchod, výbava, platby (cs,en,zh,hi,es,fr,ar,bn,pt,ru,ur,id,de,ja,tr,ko)
  Object.assign(I18N.D, {
    tab_offers: ['Nabídky', 'Offers', '优惠', 'ऑफ़र', 'Ofertas', 'Offres', 'العروض', 'অফার', 'Ofertas', 'Предложения', 'پیشکشیں', 'Penawaran', 'Angebote', 'オファー', 'Teklifler', '특가'],
    tab_armory: ['Zbrojnice', 'Armory', '军械库', 'शस्त्रागार', 'Armería', 'Armurerie', 'مستودع الأسلحة', 'অস্ত্রাগার', 'Arsenal', 'Оружейная', 'اسلحہ خانہ', 'Gudang Senjata', 'Waffenkammer', '武器庫', 'Cephanelik', '무기고'],
    role_pech: ['Pěchota', 'Infantry', '步兵', 'पैदल सेना', 'Infantería', 'Infanterie', 'المشاة', 'পদাতিক', 'Infantaria', 'Пехота', 'پیادہ فوج', 'Infanteri', 'Infanterie', '歩兵', 'Piyade', '보병'],
    role_strelec: ['Střelci', 'Archers', '弓手', 'धनुर्धर', 'Arqueros', 'Archers', 'الرماة', 'তীরন্দাজ', 'Arqueiros', 'Стрелки', 'تیر انداز', 'Pemanah', 'Schützen', '弓兵', 'Okçular', '궁수'],
    role_kopi: ['Kopiníci', 'Spearmen', '枪兵', 'भालाधारी', 'Lanceros', 'Lanciers', 'الرماحون', 'বর্শাধারী', 'Lanceiros', 'Копейщики', 'نیزہ بردار', 'Tombak', 'Speerträger', '槍兵', 'Mızrakçılar', '창병'],
    role_tezka: ['Těžká jednotka', 'Heavy unit', '重装单位', 'भारी इकाई', 'Unidad pesada', 'Unité lourde', 'وحدة ثقيلة', 'ভারী ইউনিট', 'Unidade pesada', 'Тяжёлый воин', 'بھاری یونٹ', 'Unit berat', 'Schwere Einheit', '重装兵', 'Ağır birlik', '중장 유닛'],
    b_dmg: ['útok', 'attack', '攻击', 'हमला', 'ataque', 'attaque', 'الهجوم', 'আক্রমণ', 'ataque', 'атака', 'حملہ', 'serangan', 'Angriff', '攻撃', 'saldırı', '공격'],
    b_hp: ['životy', 'health', '生命', 'जीवन', 'vida', 'PV', 'الصحة', 'জীবন', 'vida', 'здоровье', 'زندگی', 'nyawa', 'Leben', '体力', 'can', '체력'],
    b_armor: ['zbroj', 'armor', '护甲', 'कवच', 'armadura', 'armure', 'الدرع', 'বর্ম', 'armadura', 'броня', 'زرہ', 'zirah', 'Rüstung', '防御', 'zırh', '방어'],
    b_crit: ['šance na kritický zásah', 'critical hit chance', '暴击率', 'क्रिटिकल हिट मौका', 'prob. de crítico', 'chance de critique', 'فرصة الضربة الحرجة', 'ক্রিটিক্যাল সম্ভাবনা', 'chance de crítico', 'шанс крита', 'کریٹیکل موقع', 'peluang kritis', 'Krit-Chance', '会心率', 'kritik şansı', '치명타 확률'],
    crit: ['Kritický!', 'Critical!', '暴击！', 'क्रिटिकल!', '¡Crítico!', 'Critique !', 'حرجة!', 'ক্রিটিক্যাল!', 'Crítico!', 'Крит!', 'کریٹیکل!', 'Kritis!', 'Kritisch!', '会心！', 'Kritik!', '치명타!'],
    gold: ['Zlato', 'Gold', '金币', 'सोना', 'Oro', 'Or', 'ذهب', 'সোনা', 'Ouro', 'Золото', 'سونا', 'Emas', 'Gold', 'ゴールド', 'Altın', '골드'],
    gems: ['Drahokamy', 'Gems', '宝石', 'रत्न', 'Gemas', 'Gemmes', 'جواهر', 'রত্ন', 'Gemas', 'Самоцветы', 'جواہرات', 'Permata', 'Edelsteine', 'ジェム', 'Mücevher', '보석'],
    skin: ['Skin', 'Skin', '皮肤', 'स्किन', 'Aspecto', 'Apparence', 'مظهر', 'স্কিন', 'Visual', 'Облик', 'سکن', 'Skin', 'Skin', 'スキン', 'Kostüm', '스킨'],
    decor_word: ['Dekorace', 'Decoration', '装饰', 'सजावट', 'Decoración', 'Décoration', 'زينة', 'সজ্জা', 'Decoração', 'Украшение', 'سجاوٹ', 'Dekorasi', 'Dekoration', '装飾', 'Dekorasyon', '장식'],
    gear_word: ['Zbraň nebo brnění', 'Weapon or armor', '武器或护甲', 'हथियार या कवच', 'Arma o armadura', 'Arme ou armure', 'سلاح أو درع', 'অস্ত্র বা বর্ম', 'Arma ou armadura', 'Оружие или броня', 'ہتھیار یا زرہ', 'Senjata atau zirah', 'Waffe oder Rüstung', '武器か防具', 'Silah veya zırh', '무기 또는 방어구'],
    dup_comp: ['už máš → +{n} zlata', 'already owned → +{n} gold', '已拥有 → +{n} 金币', 'पहले से है → +{n} सोना', 'ya lo tienes → +{n} oro', 'déjà possédé → +{n} or', 'تملكه → +{n} ذهب', 'আগেই আছে → +{n} সোনা', 'já possui → +{n} ouro', 'уже есть → +{n} золота', 'پہلے سے ہے → +{n} سونا', 'sudah punya → +{n} emas', 'schon vorhanden → +{n} Gold', '所持済み → +{n} ゴールド', 'zaten var → +{n} altın', '보유 중 → +{n} 골드'],
    great: ['Skvělé!', 'Great!', '太好了！', 'बढ़िया!', '¡Genial!', 'Super !', 'رائع!', 'দারুণ!', 'Ótimo!', 'Отлично!', 'زبردست!', 'Hebat!', 'Super!', 'やった！', 'Harika!', '좋아요!'],
    chests: ['Truhly', 'Chests', '宝箱', 'संदूक', 'Cofres', 'Coffres', 'الصناديق', 'সিন্দুক', 'Baús', 'Сундуки', 'صندوق', 'Peti', 'Truhen', '宝箱', 'Sandıklar', '상자'],
    chests_sub: ['Náhodný obsah, šance jsou zveřejněné', 'Random contents, odds are published', '随机内容，概率已公开', 'यादृच्छिक सामग्री, संभावनाएँ प्रकाशित', 'Contenido aleatorio, probabilidades públicas', 'Contenu aléatoire, chances publiées', 'محتوى عشوائي، الاحتمالات منشورة', 'এলোমেলো উপাদান, সম্ভাবনা প্রকাশিত', 'Conteúdo aleatório, chances publicadas', 'Случайное содержимое, шансы опубликованы', 'بے ترتیب مواد، امکانات شائع', 'Isi acak, peluang dipublikasikan', 'Zufälliger Inhalt, Chancen veröffentlicht', '中身はランダム、確率を公開', 'Rastgele içerik, olasılıklar açık', '무작위 내용, 확률 공개'],
    chest_daily: ['1× denně', 'Once a day', '每日一次', 'दिन में एक बार', '1 vez al día', '1× par jour', 'مرة يوميًا', 'দিনে একবার', '1× por dia', '1 раз в день', 'دن میں ایک بار', '1× sehari', '1× täglich', '1日1回', 'Günde 1 kez', '하루 1회'],
    chest_weekly: ['1× týdně', 'Once a week', '每周一次', 'सप्ताह में एक बार', '1 vez por semana', '1× par semaine', 'مرة أسبوعيًا', 'সপ্তাহে একবার', '1× por semana', '1 раз в неделю', 'ہفتے میں ایک بار', '1× seminggu', '1× wöchentlich', '週1回', 'Haftada 1 kez', '주 1회'],
    chest_gear_sure: ['Vždy {n}× zbraň nebo brnění', 'Always {n}× weapon or armor', '必得 {n} 件武器或护甲', 'हमेशा {n}× हथियार या कवच', 'Siempre {n}× arma o armadura', 'Toujours {n}× arme ou armure', 'دائمًا {n}× سلاح أو درع', 'সবসময় {n}× অস্ত্র বা বর্ম', 'Sempre {n}× arma ou armadura', 'Всегда {n}× оружие или броня', 'ہمیشہ {n}× ہتھیار یا زرہ', 'Selalu {n}× senjata atau zirah', 'Immer {n}× Waffe oder Rüstung', '必ず武器か防具 {n} 個', 'Her zaman {n}× silah veya zırh', '무기/방어구 {n}개 확정'],
    chest_gear_chance: ['{n} % šance na zbraň nebo brnění', '{n}% chance of weapon or armor', '{n}% 概率获得武器或护甲', '{n}% हथियार/कवच का मौका', '{n} % de arma o armadura', '{n} % de chance d’arme ou armure', 'فرصة {n}% لسلاح أو درع', '{n}% অস্ত্র/বর্মের সম্ভাবনা', '{n}% de arma ou armadura', '{n}% шанс оружия или брони', '{n}% ہتھیار/زرہ کا موقع', '{n}% peluang senjata/zirah', '{n} % Chance auf Waffe/Rüstung', '{n}% で武器か防具', '%{n} silah/zırh şansı', '{n}% 확률로 무기/방어구'],
    odds: ['Šance', 'Odds', '概率', 'संभावनाएँ', 'Probabilidades', 'Chances', 'الاحتمالات', 'সম্ভাবনা', 'Chances', 'Шансы', 'امکانات', 'Peluang', 'Chancen', '確率', 'Olasılıklar', '확률'],
    odds_note: ['Obsah truhly je náhodný podle uvedených šancí. Zbraň, kterou už máš, se změní na zlato.', 'Chest contents are random with the odds shown. A duplicate item turns into gold.', '宝箱内容按所示概率随机。重复物品转换为金币。', 'संदूक की सामग्री दिखाई गई संभावनाओं के अनुसार यादृच्छिक है। दोहराई वस्तु सोने में बदलती है।', 'El contenido es aleatorio según las probabilidades. Un duplicado se convierte en oro.', 'Le contenu est aléatoire selon les chances indiquées. Un doublon devient de l’or.', 'المحتوى عشوائي حسب الاحتمالات. العنصر المكرر يتحول إلى ذهب.', 'উপাদান দেখানো সম্ভাবনা অনুযায়ী এলোমেলো। একই জিনিস সোনায় বদলায়।', 'O conteúdo é aleatório conforme as chances. Duplicatas viram ouro.', 'Содержимое случайно по указанным шансам. Повтор превращается в золото.', 'مواد دکھائے گئے امکانات کے مطابق بے ترتیب ہے۔ دہرائی چیز سونا بن جاتی ہے۔', 'Isi acak sesuai peluang. Item ganda menjadi emas.', 'Inhalt zufällig nach den Chancen. Doppelte Gegenstände werden zu Gold.', '中身は表示確率でランダム。重複はゴールドに変換。', 'İçerik gösterilen olasılıklarla rastgele. Tekrar eden eşya altına dönüşür.', '내용은 표시된 확률로 무작위입니다. 중복은 골드로 바뀝니다.'],
    chest_again: ['Zítra / příští týden', 'Tomorrow / next week', '明天 / 下周', 'कल / अगले सप्ताह', 'Mañana / próx. semana', 'Demain / sem. prochaine', 'غدًا / الأسبوع القادم', 'আগামীকাল / পরের সপ্তাহ', 'Amanhã / próx. semana', 'Завтра / след. неделя', 'کل / اگلا ہفتہ', 'Besok / minggu depan', 'Morgen / nächste Woche', '明日 / 来週', 'Yarın / gelecek hafta', '내일 / 다음 주'],
    limit_n: ['Lze koupit {n}×', 'Can be bought {n}×', '限购 {n} 次', '{n}× खरीदा जा सकता है', 'Se puede comprar {n}×', 'Achetable {n}×', 'يمكن شراؤه {n}×', '{n}× কেনা যায়', 'Pode comprar {n}×', 'Можно купить {n}×', '{n}× خریدا جا سکتا ہے', 'Bisa dibeli {n}×', '{n}× kaufbar', '{n}回まで購入可', '{n}× alınabilir', '{n}회 구매 가능'],
    bought: ['Koupeno', 'Purchased', '已购买', 'खरीदा', 'Comprado', 'Acheté', 'تم الشراء', 'কেনা হয়েছে', 'Comprado', 'Куплено', 'خریدا', 'Dibeli', 'Gekauft', '購入済み', 'Satın alındı', '구매함'],
    offers: ['Balíčky', 'Bundles', '礼包', 'बंडल', 'Paquetes', 'Packs', 'الحزم', 'বান্ডেল', 'Pacotes', 'Наборы', 'بنڈل', 'Paket', 'Pakete', 'パック', 'Paketler', '패키지'],
    offers_sub: ['Výhodné balíčky od 29 Kč', 'Great-value bundles from 29 CZK', '29 克朗起的超值礼包', '29 CZK से शानदार बंडल', 'Paquetes desde 29 CZK', 'Packs dès 29 CZK', 'حزم مميزة من 29 كرونة', '২৯ CZK থেকে বান্ডেল', 'Pacotes a partir de 29 CZK', 'Наборы от 29 CZK', '29 CZK سے بنڈل', 'Paket mulai 29 CZK', 'Pakete ab 29 CZK', '29 CZKからのお得パック', '29 CZK’dan paketler', '29 CZK부터 알뜰 패키지'],
    pay_title: ['Nákup', 'Purchase', '购买', 'खरीद', 'Compra', 'Achat', 'شراء', 'ক্রয়', 'Compra', 'Покупка', 'خریداری', 'Pembelian', 'Kauf', '購入', 'Satın alma', '구매'],
    pay_demo: ['Platby za skutečné peníze zatím nejsou zapojené. V aplikaci z Google Play, App Store nebo na herním portálu se tady otevře jejich platební okno. Teď si nákup můžeš vyzkoušet zdarma.', 'Real-money payments are not connected yet. In the Google Play / App Store app or on a game portal their payment window will open here. For now you can try the purchase for free.', '真实付款尚未接入。在 Google Play / App Store 应用或游戏平台中，这里会打开其支付窗口。现在可免费试用购买。', 'असली भुगतान अभी जुड़ा नहीं है। ऐप या गेम पोर्टल पर यहाँ उनका भुगतान खुलेगा। अभी आप मुफ़्त में आज़मा सकते हैं।', 'Los pagos reales aún no están conectados. En la app de Google Play / App Store o en un portal se abrirá aquí su ventana de pago. Por ahora puedes probarlo gratis.', 'Les paiements réels ne sont pas encore connectés. Dans l’app Google Play / App Store ou sur un portail, leur fenêtre de paiement s’ouvrira ici. Pour l’instant, essaie gratuitement.', 'المدفوعات الحقيقية غير متصلة بعد. في تطبيق المتجر أو بوابة الألعاب ستفتح نافذة الدفع هنا. يمكنك الآن التجربة مجانًا.', 'আসল পেমেন্ট এখনও যুক্ত নয়। অ্যাপ বা গেম পোর্টালে এখানে পেমেন্ট খুলবে। এখন বিনামূল্যে চেষ্টা করো।', 'Pagamentos reais ainda não estão conectados. No app da Google Play / App Store ou num portal, a janela de pagamento abrirá aqui. Por enquanto teste grátis.', 'Реальные платежи ещё не подключены. В приложении из Google Play / App Store или на игровом портале здесь откроется их оплата. Пока можно попробовать бесплатно.', 'اصل ادائیگی ابھی منسلک نہیں۔ ایپ یا گیم پورٹل پر یہاں ادائیگی کھلے گی۔ ابھی مفت آزمائیں۔', 'Pembayaran uang asli belum terhubung. Di aplikasi atau portal game, jendela pembayaran akan terbuka di sini. Sekarang coba gratis.', 'Echte Zahlungen sind noch nicht angebunden. In der App aus Google Play / App Store oder auf einem Spieleportal öffnet sich hier deren Zahlungsfenster. Jetzt kannst du es kostenlos testen.', '実際の決済はまだ未接続です。アプリやゲームポータルではここに決済画面が開きます。今は無料で試せます。', 'Gerçek ödemeler henüz bağlı değil. Uygulamada veya oyun portalında burada ödeme penceresi açılır. Şimdilik ücretsiz deneyebilirsin.', '실제 결제는 아직 연결되지 않았습니다. 앱이나 게임 포털에서는 여기서 결제 창이 열립니다. 지금은 무료로 체험할 수 있습니다.'],
    pay_demo_short: ['Ceny v Kč jsou připravené pro aplikaci a herní portály. Zatím jde nákup vyzkoušet zdarma (testovací režim).', 'CZK prices are ready for the app and game portals. For now purchases can be tried for free (test mode).', '克朗价格已为应用和游戏平台准备好。目前可免费试用购买（测试模式）。', 'CZK कीमतें ऐप के लिए तैयार हैं। अभी खरीद मुफ़्त में आज़माएँ (टेस्ट मोड)।', 'Los precios en CZK están listos para la app. Por ahora se puede probar gratis (modo prueba).', 'Les prix en CZK sont prêts pour l’app. Pour l’instant, achats gratuits en mode test.', 'الأسعار جاهزة للتطبيق. يمكن تجربة الشراء مجانًا حاليًا (وضع الاختبار).', 'CZK দাম অ্যাপের জন্য প্রস্তুত। এখন বিনামূল্যে চেষ্টা (টেস্ট মোড)।', 'Preços em CZK prontos para o app. Por enquanto teste grátis (modo teste).', 'Цены в CZK готовы для приложения. Пока покупки можно попробовать бесплатно (тест).', 'CZK قیمتیں ایپ کے لیے تیار ہیں۔ ابھی مفت آزمائیں (ٹیسٹ موڈ)۔', 'Harga CZK siap untuk aplikasi. Untuk sekarang coba gratis (mode uji).', 'CZK-Preise sind für App und Portale vorbereitet. Vorerst kostenlos testbar (Testmodus).', 'CZK価格はアプリ用に準備済み。今は無料で試せます（テストモード）。', 'CZK fiyatları uygulama için hazır. Şimdilik ücretsiz deneme (test modu).', 'CZK 가격은 앱용으로 준비되어 있습니다. 지금은 무료 체험(테스트 모드).'],
    pay_test: ['Vyzkoušet zdarma (test)', 'Try for free (test)', '免费试用（测试）', 'मुफ़्त आज़माएँ (टेस्ट)', 'Probar gratis (prueba)', 'Essayer gratuitement (test)', 'جرّب مجانًا (اختبار)', 'বিনামূল্যে চেষ্টা (টেস্ট)', 'Testar grátis (teste)', 'Попробовать бесплатно (тест)', 'مفت آزمائیں (ٹیسٹ)', 'Coba gratis (uji)', 'Kostenlos testen (Test)', '無料で試す（テスト）', 'Ücretsiz dene (test)', '무료 체험 (테스트)'],
    pay_failed: ['Platba se nezdařila.', 'Payment failed.', '付款失败。', 'भुगतान विफल।', 'El pago falló.', 'Paiement échoué.', 'فشل الدفع.', 'পেমেন্ট ব্যর্থ।', 'Pagamento falhou.', 'Оплата не прошла.', 'ادائیگی ناکام۔', 'Pembayaran gagal.', 'Zahlung fehlgeschlagen.', '決済に失敗しました。', 'Ödeme başarısız.', '결제 실패.'],
    take_off: ['Sundat', 'Unequip', '卸下', 'हटाएँ', 'Quitar', 'Retirer', 'نزع', 'খুলে ফেলো', 'Remover', 'Снять', 'اتاریں', 'Lepas', 'Ablegen', '外す', 'Çıkar', '해제'],
    no_bonus: ['Zatím bez výbavy', 'No gear yet', '尚无装备', 'अभी कोई उपकरण नहीं', 'Sin equipo aún', 'Pas encore d’équipement', 'لا معدات بعد', 'এখনও কোনো সরঞ্জাম নেই', 'Sem equipamento', 'Пока без снаряжения', 'ابھی سامان نہیں', 'Belum ada perlengkapan', 'Noch keine Ausrüstung', '装備なし', 'Henüz ekipman yok', '아직 장비 없음'],
    armory_note: ['Výbava platí pro tuto roli u všech národů a vojáci ji mají i na bojišti.', 'Gear applies to this role for all nations, and soldiers wear it on the battlefield.', '装备适用于所有民族的该兵种，士兵在战场上也会穿戴。', 'उपकरण सभी राष्ट्रों की इस भूमिका पर लागू होता है और युद्ध में भी दिखता है।', 'El equipo vale para este rol en todas las naciones y se ve en batalla.', 'L’équipement vaut pour ce rôle dans toutes les nations et se voit au combat.', 'تنطبق المعدات على هذا الدور لكل الأمم وتظهر في المعركة.', 'সরঞ্জাম সব জাতির এই ভূমিকায় প্রযোজ্য এবং যুদ্ধেও দেখা যায়।', 'O equipamento vale para este papel em todas as nações e aparece na batalha.', 'Снаряжение действует для этой роли у всех народов и видно в бою.', 'سامان تمام قوموں کے اس کردار پر لاگو اور جنگ میں نظر آتا ہے۔', 'Perlengkapan berlaku untuk peran ini di semua bangsa dan terlihat di medan perang.', 'Ausrüstung gilt für diese Rolle bei allen Völkern und ist im Kampf sichtbar.', '装備は全国家のこの兵種に適用され、戦場でも見えます。', 'Ekipman tüm uluslarda bu rol için geçerli ve savaşta görünür.', '장비는 모든 나라의 이 병과에 적용되며 전장에서도 보입니다.'],
    weapons: ['Zbraně', 'Weapons', '武器', 'हथियार', 'Armas', 'Armes', 'الأسلحة', 'অস্ত্র', 'Armas', 'Оружие', 'ہتھیار', 'Senjata', 'Waffen', '武器', 'Silahlar', '무기'],
    armors: ['Brnění', 'Armor', '护甲', 'कवच', 'Armaduras', 'Armures', 'الدروع', 'বর্ম', 'Armaduras', 'Броня', 'زرہ', 'Zirah', 'Rüstungen', '防具', 'Zırhlar', '방어구']
  });

  Object.assign(I18N.D, {
    nav_sprava: ['Vylepšení', 'Upgrades', '升级', 'उन्नयन', 'Mejoras', 'Améliorations', 'الترقيات', 'আপগ্রেড', 'Melhorias', 'Улучшения', 'اپ گریڈ', 'Peningkatan', 'Ausbau', '強化', 'Geliştirme', '강화']
  });

  Object.assign(I18N.D, {
    daily_free: ['Zdarma každý den', 'Free every day', '每日免费', 'हर दिन मुफ़्त', 'Gratis cada día', 'Gratuit chaque jour', 'مجانًا كل يوم', 'প্রতিদিন বিনামূল্যে', 'Grátis todo dia', 'Бесплатно каждый день', 'ہر روز مفت', 'Gratis setiap hari', 'Jeden Tag gratis', '毎日無料', 'Her gün ücretsiz', '매일 무료'],
    daily_title: ['Denní odměny', 'Daily Rewards', '每日奖励', 'दैनिक इनाम', 'Recompensas diarias', 'Récompenses quotidiennes', 'المكافآت اليومية', 'দৈনিক পুরস্কার', 'Recompensas diárias', 'Ежедневные награды', 'روزانہ انعامات', 'Hadiah Harian', 'Tägliche Belohnungen', 'デイリー報酬', 'Günlük Ödüller', '일일 보상'],
    daily_short: ['Odměna', 'Reward', '奖励', 'इनाम', 'Premio', 'Cadeau', 'مكافأة', 'পুরস্কার', 'Prêmio', 'Награда', 'انعام', 'Hadiah', 'Belohnung', '報酬', 'Ödül', '보상'],
    daily_rule: ['Hraj 14 dní v kuse a získáš exkluzivní skin, který se jinak nedá sehnat. Když den vynecháš, začínáš znovu od 1. dne.', 'Play 14 days in a row to get an exclusive skin you cannot get any other way. Miss a day and you start again from day 1.', '连续玩 14 天可获得无法通过其他方式获得的专属皮肤。中断一天就从第 1 天重新开始。', 'लगातार 14 दिन खेलो और एक विशेष स्किन पाओ। एक दिन छूटा तो फिर पहले दिन से।', 'Juega 14 días seguidos y consigue un aspecto exclusivo. Si fallas un día, empiezas de nuevo.', 'Joue 14 jours d’affilée pour une apparence exclusive. Un jour manqué et tu recommences au jour 1.', 'العب 14 يومًا متتاليًا لتحصل على مظهر حصري. إن فاتك يوم تبدأ من جديد.', 'টানা ১৪ দিন খেলো, একচেটিয়া স্কিন পাও। একদিন বাদ গেলে আবার শুরু।', 'Jogue 14 dias seguidos e ganhe um visual exclusivo. Se perder um dia, recomeça do dia 1.', 'Играй 14 дней подряд и получи эксклюзивный облик. Пропустишь день — начнёшь заново.', 'لگاتار 14 دن کھیلیں اور خاص سکن پائیں۔ ایک دن چھوٹا تو پھر سے شروع۔', 'Main 14 hari berturut-turut untuk skin eksklusif. Lewat sehari, mulai lagi dari hari 1.', 'Spiele 14 Tage am Stück für einen exklusiven Skin. Verpasst du einen Tag, beginnst du von vorn.', '14日連続でプレイすると限定スキンを入手。1日休むと1日目から。', '14 gün üst üste oyna, özel kostümü kazan. Bir gün kaçırırsan baştan başlarsın.', '14일 연속 플레이하면 한정 스킨을 받습니다. 하루라도 빠지면 1일째부터 다시.'],
    day_n: ['{n}. den', 'Day {n}', '第{n}天', 'दिन {n}', 'Día {n}', 'Jour {n}', 'اليوم {n}', 'দিন {n}', 'Dia {n}', 'День {n}', 'دن {n}', 'Hari {n}', 'Tag {n}', '{n}日目', '{n}. gün', '{n}일째'],
    streak_n: ['Řada: {n} dní v kuse', 'Streak: {n} days in a row', '连续：{n} 天', 'लगातार: {n} दिन', 'Racha: {n} días seguidos', 'Série : {n} jours d’affilée', 'السلسلة: {n} أيام', 'ধারা: টানা {n} দিন', 'Sequência: {n} dias', 'Серия: {n} дней подряд', 'سلسلہ: {n} دن', 'Beruntun: {n} hari', 'Serie: {n} Tage am Stück', '連続：{n}日', 'Seri: {n} gün', '연속: {n}일'],
    daily_tomorrow: ['Další odměna zítra', 'Next reward tomorrow', '明天领取下一个奖励', 'अगला इनाम कल', 'Próximo premio mañana', 'Prochaine récompense demain', 'المكافأة التالية غدًا', 'পরের পুরস্কার আগামীকাল', 'Próximo prêmio amanhã', 'Следующая награда завтра', 'اگلا انعام کل', 'Hadiah berikutnya besok', 'Nächste Belohnung morgen', '次の報酬は明日', 'Sonraki ödül yarın', '다음 보상은 내일'],
    exclusive: ['Exkluzivní', 'Exclusive', '专属', 'विशेष', 'Exclusivo', 'Exclusif', 'حصري', 'একচেটিয়া', 'Exclusivo', 'Эксклюзив', 'خاص', 'Eksklusif', 'Exklusiv', '限定', 'Özel', '한정'],
    pick_unit: ['Vyber postavu, které skin dáš. Bude ho moct nosit jen ona.', 'Choose the character who gets the skin. Only they can wear it.', '选择获得此皮肤的角色，只有它能穿戴。', 'चुनो किस पात्र को स्किन मिलेगी। केवल वही पहन सकेगा।', 'Elige el personaje que recibirá el aspecto. Solo él podrá usarlo.', 'Choisis le personnage qui reçoit l’apparence. Lui seul pourra la porter.', 'اختر الشخصية التي تحصل على المظهر. هي وحدها ترتديه.', 'কোন চরিত্র স্কিন পাবে বেছে নাও। শুধু সে-ই পরবে।', 'Escolha o personagem que recebe o visual. Só ele poderá usar.', 'Выбери персонажа, который получит облик. Носить сможет только он.', 'کردار چنیں جسے سکن ملے۔ صرف وہی پہن سکے گا۔', 'Pilih karakter penerima skin. Hanya dia yang bisa memakainya.', 'Wähle die Figur, die den Skin bekommt. Nur sie kann ihn tragen.', 'スキンを渡すキャラを選んでください。そのキャラだけが装備できます。', 'Kostümü alacak karakteri seç. Sadece o giyebilir.', '스킨을 받을 캐릭터를 고르세요. 그 캐릭터만 착용할 수 있습니다.'],
    skin_given: ['{name} patří postavě {unit}!', '{name} now belongs to {unit}!', '{name} 已属于 {unit}！', '{name} अब {unit} का है!', '¡{name} es ahora de {unit}!', '{name} appartient à {unit} !', '{name} أصبح لـ {unit}!', '{name} এখন {unit}-এর!', '{name} agora é de {unit}!', '{name} теперь у {unit}!', '{name} اب {unit} کا ہے!', '{name} kini milik {unit}!', '{name} gehört jetzt {unit}!', '{name}は{unit}のものに！', '{name} artık {unit} için!', '{name}이(가) {unit}의 것이 되었습니다!'],
    only_for: ['Jen pro: {name}', 'Only for: {name}', '仅限：{name}', 'केवल: {name}', 'Solo para: {name}', 'Seulement : {name}', 'فقط لـ: {name}', 'শুধু: {name}', 'Só para: {name}', 'Только для: {name}', 'صرف: {name}', 'Hanya untuk: {name}', 'Nur für: {name}', '{name}専用', 'Sadece: {name}', '{name} 전용']
  });

  Object.assign(I18N.D, {
    def_title: ['Obrana hradu', 'Castle Defense', '城堡防御', 'किले की रक्षा', 'Defensa del castillo', 'Défense du château', 'دفاع القلعة', 'দুর্গ রক্ষা', 'Defesa do castelo', 'Оборона замка', 'قلعے کا دفاع', 'Pertahanan Kastil', 'Burgverteidigung', '城の防衛', 'Kale Savunması', '성 방어'],
    def_sub: ['{n} / {m} míst na hradbách', '{n} / {m} wall slots', '城墙位置 {n} / {m}', 'दीवार स्थान {n} / {m}', '{n} / {m} puestos', '{n} / {m} postes', '{n} / {m} مواقع', '{n} / {m} স্থান', '{n} / {m} posições', '{n} / {m} мест', '{n} / {m} جگہیں', '{n} / {m} posisi', '{n} / {m} Plätze', '配置枠 {n} / {m}', '{n} / {m} yer', '자리 {n} / {m}'],
    def_note: ['Každé 2 úrovně Strážní věže otevřou nové místo (nejvýš 5). Katapult jde postavit od {n}. úrovně věže.', 'Every 2 Watchtower levels open a new slot (up to 5). Catapults unlock at tower level {n}.', '箭塔每升 2 级开放一个位置（最多 5 个）。投石机在 {n} 级解锁。', 'हर 2 स्तर पर नया स्थान (अधिकतम 5)। गुलेल स्तर {n} से।', 'Cada 2 niveles de la torre abre un puesto (máx. 5). Catapulta desde el nivel {n}.', 'Tous les 2 niveaux de tour, un nouveau poste (max 5). Catapulte dès le niveau {n}.', 'كل مستويين للبرج يفتحان موقعًا (حتى 5). المنجنيق من المستوى {n}.', 'প্রতি ২ স্তরে নতুন স্থান (সর্বোচ্চ ৫)। ক্যাটাপুল্ট স্তর {n} থেকে।', 'A cada 2 níveis da torre, nova posição (máx. 5). Catapulta a partir do nível {n}.', 'Каждые 2 уровня башни — новое место (до 5). Катапульта с {n} уровня.', 'ہر 2 درجے پر نئی جگہ (زیادہ سے زیادہ 5)۔ منجنیق درجہ {n} سے۔', 'Setiap 2 level menara membuka posisi baru (maks 5). Katapel mulai level {n}.', 'Alle 2 Turmstufen ein neuer Platz (max. 5). Katapult ab Turmstufe {n}.', '見張り塔2レベルごとに枠が増える（最大5）。投石機は{n}レベルから。', 'Her 2 kule seviyesi yeni yer açar (en fazla 5). Mancınık {n}. seviyeden.', '망루 2레벨마다 자리 1개(최대 5). 투석기는 {n}레벨부터.'],
    def_slot: ['Místo {n}', 'Slot {n}', '位置 {n}', 'स्थान {n}', 'Puesto {n}', 'Poste {n}', 'الموقع {n}', 'স্থান {n}', 'Posição {n}', 'Место {n}', 'جگہ {n}', 'Posisi {n}', 'Platz {n}', '枠 {n}', 'Yer {n}', '자리 {n}'],
    def_unlock_at: ['Věž úrovně {n}', 'Tower level {n}', '箭塔 {n} 级', 'मीनार स्तर {n}', 'Torre nivel {n}', 'Tour niveau {n}', 'البرج مستوى {n}', 'মিনার স্তর {n}', 'Torre nível {n}', 'Башня ур. {n}', 'مینار درجہ {n}', 'Menara level {n}', 'Turm Stufe {n}', '塔 Lv{n}', 'Kule sev. {n}', '망루 {n}레벨'],
    def_from_lvl: ['od {n}. úr.', 'from lvl {n}', '{n} 级起', 'स्तर {n} से', 'desde nv. {n}', 'dès niv. {n}', 'من مستوى {n}', 'স্তর {n} থেকে', 'a partir do nv. {n}', 'с ур. {n}', 'درجہ {n} سے', 'mulai lv {n}', 'ab Stufe {n}', 'Lv{n}から', '{n}. sev.ten', '{n}레벨부터'],
    def_lucistnik: ['Lučištník', 'Archer', '弓手', 'धनुर्धर', 'Arquero', 'Archer', 'رامي', 'তীরন্দাজ', 'Arqueiro', 'Лучник', 'تیر انداز', 'Pemanah', 'Bogenschütze', '弓兵', 'Okçu', '궁수'],
    def_kuse: ['Kušiník', 'Crossbowman', '弩手', 'क्रॉसबोमैन', 'Ballestero', 'Arbalétrier', 'رامي القوس', 'ক্রসবোম্যান', 'Besteiro', 'Арбалетчик', 'کراس بو والا', 'Pemanah silang', 'Armbrustschütze', 'クロスボウ兵', 'Arbaletçi', '석궁병'],
    def_katapult: ['Katapult', 'Catapult', '投石机', 'गुलेल', 'Catapulta', 'Catapulte', 'منجنيق', 'ক্যাটাপুল্ট', 'Catapulta', 'Катапульта', 'منجنیق', 'Katapel', 'Katapult', '投石機', 'Mancınık', '투석기'],
    def_dmg: ['Zranění {n}', 'Damage {n}', '伤害 {n}', 'क्षति {n}', 'Daño {n}', 'Dégâts {n}', 'الضرر {n}', 'ক্ষতি {n}', 'Dano {n}', 'Урон {n}', 'نقصان {n}', 'Kerusakan {n}', 'Schaden {n}', 'ダメージ {n}', 'Hasar {n}', '피해 {n}'],
    not_enough: ['Nemáš dost zlata nebo drahokamů.', 'Not enough gold or gems.', '金币或宝石不足。', 'पर्याप्त सोना या रत्न नहीं।', 'No tienes suficiente oro o gemas.', 'Pas assez d’or ou de gemmes.', 'لا يوجد ذهب أو جواهر كافية.', 'যথেষ্ট সোনা বা রত্ন নেই।', 'Ouro ou gemas insuficientes.', 'Не хватает золота или самоцветов.', 'سونا یا جواہرات کم ہیں۔', 'Emas atau permata tidak cukup.', 'Nicht genug Gold oder Edelsteine.', 'ゴールドかジェムが足りません。', 'Yeterli altın veya mücevher yok.', '골드나 보석이 부족합니다.']
  });

  Object.assign(I18N.D, {
    pick_avatar: ['Vyber profilový obrázek', 'Choose your portrait', '选择头像', 'अपना चित्र चुनें', 'Elige tu retrato', 'Choisis ton portrait', 'اختر صورتك', 'তোমার প্রতিকৃতি বেছে নাও', 'Escolha seu retrato', 'Выбери портрет', 'اپنی تصویر چنیں', 'Pilih potretmu', 'Wähle dein Porträt', 'プロフィール画像を選択', 'Portreni seç', '초상화를 고르세요']
  });

  Object.assign(I18N.D, {
    daily_rule2: ['Skin máš! Odměny ale pokračují každý den donekonečna a každý týden jsou o něco větší. Každý 30. den bonus 300 drahokamů.', 'You have the skin! Rewards continue every day forever and grow a little each week. Every 30th day: a 300-gem bonus.', '皮肤已获得！奖励每天继续，且每周增加。每第 30 天额外 300 宝石。', 'स्किन मिल गई! इनाम हर दिन जारी रहेंगे और हर सप्ताह बढ़ेंगे। हर 30वें दिन 300 रत्न बोनस।', '¡Ya tienes el aspecto! Los premios siguen cada día y crecen cada semana. Cada día 30: 300 gemas extra.', 'Tu as l’apparence ! Les récompenses continuent chaque jour et augmentent chaque semaine. Tous les 30 jours : 300 gemmes en bonus.', 'حصلت على المظهر! المكافآت تستمر يوميًا وتزداد كل أسبوع. كل يوم 30: مكافأة 300 جوهرة.', 'স্কিন পেয়েছ! পুরস্কার প্রতিদিন চলবে, প্রতি সপ্তাহে বাড়বে। প্রতি ৩০তম দিনে ৩০০ রত্ন।', 'Você tem o visual! As recompensas continuam todo dia e crescem a cada semana. A cada 30 dias: 300 gemas extras.', 'Облик твой! Награды продолжаются каждый день и растут каждую неделю. Каждый 30-й день — 300 самоцветов.', 'سکن مل گئی! انعامات ہر روز جاری رہیں گے اور ہر ہفتے بڑھیں گے۔ ہر 30ویں دن 300 جواہرات۔', 'Skin sudah kamu miliki! Hadiah berlanjut tiap hari dan naik tiap minggu. Tiap hari ke-30: bonus 300 permata.', 'Der Skin gehört dir! Die Belohnungen gehen jeden Tag weiter und wachsen jede Woche. Jeden 30. Tag: 300 Edelsteine Bonus.', 'スキン獲得済み！報酬は毎日続き、毎週少しずつ増えます。30日ごとに300ジェム。', 'Kostüm senin! Ödüller her gün sürer ve her hafta artar. Her 30. gün 300 mücevher bonus.', '스킨 획득! 보상은 매일 계속되고 매주 조금씩 커집니다. 30일마다 보석 300개 보너스.']
  });

  Object.assign(I18N.D, {
    squad: ['Oddíl', 'Squad', '小队', 'दस्ता', 'Escuadra', 'Escouade', 'فرقة', 'দল', 'Esquadrão', 'Отряд', 'دستہ', 'Pasukan', 'Trupp', '分隊', 'Bölük', '분대'],
    squad_pick: ['Oddíl', 'Squad', '小队', 'दस्ता', 'Escuadra', 'Escouade', 'فرقة', 'দল', 'Esquadrão', 'Отряд', 'دستہ', 'Pasukan', 'Trupp', '分隊', 'Bölük', '분대'],
    squad_n: ['Oddíl: {n}', 'Squad: {n}', '小队：{n}', 'दस्ता: {n}', 'Escuadra: {n}', 'Escouade : {n}', 'فرقة: {n}', 'দল: {n}', 'Esquadrão: {n}', 'Отряд: {n}', 'دستہ: {n}', 'Pasukan: {n}', 'Trupp: {n}', '分隊：{n}', 'Bölük: {n}', '분대: {n}'],
    squad_hint: ['Táhni prstem přes vojáky, které chceš dát do oddílu', 'Drag your finger over the soldiers you want in the squad', '用手指划过要编入小队的士兵', 'जिन सैनिकों को दस्ते में चाहिए उन पर उंगली खींचें', 'Arrastra el dedo sobre los soldados de la escuadra', 'Fais glisser ton doigt sur les soldats de l’escouade', 'اسحب إصبعك فوق الجنود الذين تريدهم في الفرقة', 'যে সৈন্যদের দলে চাও তাদের উপর আঙুল টানো', 'Arraste o dedo sobre os soldados do esquadrão', 'Проведи пальцем по воинам для отряда', 'جن سپاہیوں کو دستے میں چاہتے ہو ان پر انگلی کھینچو', 'Seret jari di atas prajurit untuk pasukan', 'Zieh den Finger über die Soldaten für den Trupp', '分隊に入れる兵士を指でなぞって選択', 'Bölüğe almak istediğin askerlerin üzerinden parmağını kaydır', '분대에 넣을 병사 위로 손가락을 드래그하세요'],
    rotate: ['Otoč zařízení na šířku', 'Turn your device sideways', '请横向旋转设备', 'डिवाइस को आड़ा घुमाएँ', 'Gira el dispositivo en horizontal', 'Tourne ton appareil en paysage', 'أدر جهازك أفقيًا', 'ডিভাইসটি আড়াআড়ি ঘোরাও', 'Gire o aparelho na horizontal', 'Поверни устройство горизонтально', 'آلہ افقی گھمائیں', 'Putar perangkat ke posisi mendatar', 'Dreh dein Gerät quer', '端末を横向きにしてください', 'Cihazını yatay çevir', '기기를 가로로 돌려주세요']
  });

  Object.assign(I18N.D, {
    big_name: ['Velká pevnost', 'Great Fortress', '巨型要塞', 'महान किला', 'Gran Fortaleza', 'Grande Forteresse', 'القلعة الكبرى', 'মহা দুর্গ', 'Grande Fortaleza', 'Великая крепость', 'عظیم قلعہ', 'Benteng Agung', 'Große Festung', '大要塞', 'Büyük Kale', '거대 요새'],
    big_eyebrow: ['Exkluzivní hrad', 'Exclusive castle', '专属城堡', 'विशेष किला', 'Castillo exclusivo', 'Château exclusif', 'قلعة حصرية', 'বিশেষ দুর্গ', 'Castelo exclusivo', 'Эксклюзивный замок', 'خاص قلعہ', 'Kastil eksklusif', 'Exklusive Burg', '限定の城', 'Özel kale', '독점 성'],
    big_short: ['Až 10 obránců', 'Up to 10 defenders', '最多 10 名守卫', '10 रक्षक तक', 'Hasta 10 defensores', 'Jusqu’à 10 défenseurs', 'حتى 10 مدافعين', '১০ জন রক্ষী পর্যন্ত', 'Até 10 defensores', 'До 10 защитников', '10 محافظ تک', 'Hingga 10 penjaga', 'Bis zu 10 Verteidiger', '守備兵最大10人', '10 savunucuya kadar', '최대 수비병 10명'],
    big_desc: ['Větší hrad s mohutným donjonem a dvěma věžemi. Na hradbách unese až 10 lučištníků, kušiníků nebo katapultů – každá úroveň Strážní věže otevře jedno místo, na maximu (10) jich je 10. Hrad má navíc o 25 % víc životů.', 'A bigger castle with a mighty keep and two towers. Its walls hold up to 10 archers, crossbowmen or catapults – each Watchtower level opens one spot, at max (10) there are 10. The castle also has 25% more health.', '更大的城堡，拥有雄伟的主塔和两座塔楼。城墙可容纳最多 10 名弓箭手、弩手或投石机——瞭望塔每升一级开放一个位置，满级（10）共 10 个。城堡生命值另增 25%。', 'बड़ा किला, विशाल मीनार और दो बुर्जों के साथ। दीवारों पर 10 तक धनुर्धर, क्रॉसबोमैन या गुलेल – प्रहरी मीनार का हर स्तर एक जगह खोलता है, अधिकतम (10) पर 10 जगहें। किले की जान 25% अधिक।', 'Un castillo mayor con un gran torreón y dos torres. Sus murallas admiten hasta 10 arqueros, ballesteros o catapultas: cada nivel de la Atalaya abre un puesto; al máximo (10) hay 10. Además, el castillo tiene un 25 % más de vida.', 'Un château plus grand avec un puissant donjon et deux tours. Ses remparts accueillent jusqu’à 10 archers, arbalétriers ou catapultes : chaque niveau de la Tour de guet ouvre un poste, au maximum (10) il y en a 10. Le château a aussi 25 % de vie en plus.', 'قلعة أكبر ببرج رئيسي ضخم وبرجين. تتسع أسوارها لـ10 رماة أو رماة أقواس أو منجنيقات – كل مستوى لبرج المراقبة يفتح موقعًا، وعند الحد الأقصى (10) تصبح 10. وللقلعة صحة أكثر بنسبة 25%.', 'বিশাল কেন্দ্রীয় মিনার ও দুই বুরুজসহ বড় দুর্গ। দেয়ালে ১০ জন পর্যন্ত তীরন্দাজ, ক্রসবোম্যান বা গুলতি – প্রহরী মিনারের প্রতি স্তরে একটি জায়গা, সর্বোচ্চ (১০) স্তরে ১০টি। দুর্গের প্রাণ ২৫% বেশি।', 'Um castelo maior com uma grande torre de menagem e duas torres. As muralhas comportam até 10 arqueiros, besteiros ou catapultas – cada nível da Torre de Vigia abre um posto; no máximo (10) são 10. O castelo também tem 25% mais vida.', 'Замок побольше с могучим донжоном и двумя башнями. На стенах до 10 лучников, арбалетчиков или катапульт – каждый уровень Сторожевой башни открывает место, на максимуме (10) их 10. У замка также на 25% больше прочности.', 'عظیم مینار اور دو برجوں والا بڑا قلعہ۔ دیواروں پر 10 تک تیر انداز، کمان بردار یا منجنیق – نگرانی مینار کی ہر سطح ایک جگہ کھولتی ہے، زیادہ سے زیادہ (10) پر 10۔ قلعے کی جان 25% زیادہ۔', 'Kastil lebih besar dengan menara utama megah dan dua menara. Temboknya muat hingga 10 pemanah, pemanah silang, atau katapel – tiap level Menara Pengawas membuka satu tempat, di level maks (10) ada 10. Nyawa kastil juga 25% lebih banyak.', 'Eine größere Burg mit mächtigem Bergfried und zwei Türmen. Auf den Mauern haben bis zu 10 Bogenschützen, Armbrustschützen oder Katapulte Platz – jede Stufe des Wachturms öffnet einen Platz, auf Maximum (10) sind es 10. Die Burg hat außerdem 25 % mehr Leben.', '巨大な天守と2つの塔を持つ大きな城。城壁に弓兵・弩兵・投石機を最大10配置――物見櫓のレベルごとに1枠、最大（10）で10枠。城の耐久も25%アップ。', 'Görkemli bir iç kale ve iki kuleyle daha büyük bir kale. Surlarda 10’a kadar okçu, arbaletçi veya mancınık – Gözetleme Kulesi’nin her seviyesi bir yer açar, maksimumda (10) 10 yer. Kalenin canı da %25 fazla.', '거대한 본성과 두 탑을 갖춘 더 큰 성. 성벽에 궁수, 석궁병, 투석기를 최대 10기 배치 – 감시탑 레벨마다 한 자리, 최대(10)에서 10자리. 성의 체력도 25% 증가.'],
    big_more: ['Chceš až 10 míst? Velká pevnost v obchodě →', 'Want up to 10 spots? Great Fortress in the shop →', '想要 10 个位置？商店里的巨型要塞 →', '10 जगहें चाहिए? दुकान में महान किला →', '¿Quieres hasta 10 puestos? Gran Fortaleza en la tienda →', 'Jusqu’à 10 postes ? Grande Forteresse en boutique →', 'تريد 10 مواقع؟ القلعة الكبرى في المتجر ←', '১০টি জায়গা চাও? দোকানে মহা দুর্গ →', 'Quer até 10 postos? Grande Fortaleza na loja →', 'Нужно 10 мест? Великая крепость в магазине →', '10 جگہیں چاہییں؟ دکان میں عظیم قلعہ ←', 'Mau 10 tempat? Benteng Agung di toko →', 'Bis zu 10 Plätze? Große Festung im Shop →', '最大10枠？ショップの大要塞へ →', '10 yer mi istiyorsun? Mağazada Büyük Kale →', '10자리가 필요하다면? 상점의 거대 요새 →'],
    owned: ['Vlastníš', 'Owned', '已拥有', 'आपके पास', 'Tuyo', 'Possédé', 'مملوك', 'তোমার', 'Seu', 'Есть', 'آپ کا', 'Dimiliki', 'Im Besitz', '所持', 'Sahip', '보유']
  });

  Object.assign(I18N.D, {
    skin_nation: ['Skin národa', 'Nation skin', '民族皮肤', 'राष्ट्र स्किन', 'Aspecto de nación', 'Apparence de nation', 'مظهر الأمة', 'জাতির স্কিন', 'Visual da nação', 'Облик народа', 'قوم کی سکن', 'Skin bangsa', 'Volks-Skin', '国家スキン', 'Ulus kostümü', '국가 스킨'],
    skin_mount: ['Na koni', 'On horseback', '骑马', 'घोड़े पर', 'A caballo', 'À cheval', 'على الخيل', 'ঘোড়ায়', 'A cavalo', 'Верхом', 'گھوڑے پر', 'Berkuda', 'Zu Pferd', '騎馬', 'Atlı', '기마'],
    weapon_skins: ['Skiny zbraní', 'Weapon skins', '武器皮肤', 'हथियार स्किन', 'Aspectos de armas', 'Apparences d’armes', 'مظاهر الأسلحة', 'অস্ত্রের স্কিন', 'Visuais de armas', 'Облики оружия', 'ہتھیاروں کی سکن', 'Skin senjata', 'Waffen-Skins', '武器スキン', 'Silah kostümleri', '무기 스킨']
  });

  Object.assign(I18N.D, {
    castle_types: ['Druhy hradu', 'Castle types', '城堡类型', 'किले के प्रकार', 'Tipos de castillo', 'Types de château', 'أنواع القلاع', 'দুর্গের ধরন', 'Tipos de castelo', 'Виды замков', 'قلعوں کی اقسام', 'Jenis kastil', 'Burgtypen', '城の種類', 'Kale türleri', '성 종류'],
    castle_looks: ['Vzhled hradu', 'Castle looks', '城堡外观', 'किले का रूप', 'Aspecto del castillo', 'Apparence du château', 'مظهر القلعة', 'দুর্গের রূপ', 'Visual do castelo', 'Облик замка', 'قلعے کی شکل', 'Tampilan kastil', 'Burg-Aussehen', '城の見た目', 'Kale görünümü', '성 외형'],
    small_eyebrow: ['Základní hrad', 'Starter castle', '基础城堡', 'मूल किला', 'Castillo básico', 'Château de base', 'القلعة الأساسية', 'মৌলিক দুর্গ', 'Castelo básico', 'Базовый замок', 'بنیادی قلعہ', 'Kastil dasar', 'Grundburg', '基本の城', 'Temel kale', '기본 성'],
    small_name: ['Malý hrad', 'Small Castle', '小城堡', 'छोटा किला', 'Castillo pequeño', 'Petit château', 'القلعة الصغيرة', 'ছোট দুর্গ', 'Castelo pequeno', 'Малый замок', 'چھوٹا قلعہ', 'Kastil kecil', 'Kleine Burg', '小さな城', 'Küçük kale', '작은 성'],
    small_desc: ['Hrad, se kterým začínáš. Na hradbách unese nejvýš 5 obránců.', 'The castle you start with. Its walls hold at most 5 defenders.', '你起步时的城堡。城墙最多容纳 5 名守卫。', 'वह किला जिससे आप शुरू करते हैं। दीवारों पर अधिकतम 5 रक्षक।', 'El castillo con el que empiezas. Sus murallas admiten 5 defensores como máximo.', 'Le château de départ. Ses remparts accueillent 5 défenseurs au maximum.', 'القلعة التي تبدأ بها. تتسع أسوارها لـ5 مدافعين كحد أقصى.', 'যে দুর্গ দিয়ে শুরু করো। দেয়ালে সর্বোচ্চ ৫ জন রক্ষী।', 'O castelo com que você começa. As muralhas comportam no máximo 5 defensores.', 'Замок, с которого ты начинаешь. На стенах не больше 5 защитников.', 'وہ قلعہ جس سے آپ شروع کرتے ہیں۔ دیواروں پر زیادہ سے زیادہ 5 محافظ۔', 'Kastil awalmu. Temboknya muat paling banyak 5 penjaga.', 'Die Burg, mit der du beginnst. Auf ihren Mauern haben höchstens 5 Verteidiger Platz.', '最初の城。城壁には守備兵を最大5人まで。', 'Başladığın kale. Surlarında en fazla 5 savunucu olur.', '처음 시작하는 성. 성벽에 수비병은 최대 5명.']
  });

  Object.assign(I18N.D, {
    queue_n: ['zásobník {n}', 'queue {n}', '队列 {n}', 'कतार {n}', 'cola {n}', 'file {n}', 'طابور {n}', 'সারি {n}', 'fila {n}', 'очередь {n}', 'قطار {n}', 'antrean {n}', 'Warteschl. {n}', '待機 {n}', 'sıra {n}', '대기 {n}'],
    queue_cleared: ['Zásobník vyprázdněn', 'Queue cleared', '队列已清空', 'कतार खाली', 'Cola vaciada', 'File vidée', 'تم إفراغ الطابور', 'সারি খালি', 'Fila esvaziada', 'Очередь очищена', 'قطار خالی', 'Antrean dikosongkan', 'Warteschlange geleert', '待機を解除', 'Sıra temizlendi', '대기열 비움']
  });

  Object.assign(I18N.D, {
    tester_on: ['Testovací režim: neomezené zlato a drahokamy', 'Test mode: unlimited gold and gems', '测试模式：无限金币和宝石', 'परीक्षण मोड: असीमित सोना और रत्न', 'Modo prueba: oro y gemas ilimitados', 'Mode test : or et gemmes illimités', 'وضع الاختبار: ذهب وجواهر بلا حدود', 'পরীক্ষা মোড: সীমাহীন সোনা ও রত্ন', 'Modo teste: ouro e gemas ilimitados', 'Тест-режим: бесконечное золото и самоцветы', 'ٹیسٹ موڈ: لامحدود سونا اور جواہرات', 'Mode uji: emas dan permata tanpa batas', 'Testmodus: unbegrenzt Gold und Edelsteine', 'テストモード：ゴールドとジェム無制限', 'Test modu: sınırsız altın ve mücevher', '테스트 모드: 무제한 골드와 보석'],
    tester_off: ['Testovací režim vypnut', 'Test mode off', '测试模式已关闭', 'परीक्षण मोड बंद', 'Modo prueba desactivado', 'Mode test désactivé', 'تم إيقاف وضع الاختبار', 'পরীক্ষা মোড বন্ধ', 'Modo teste desligado', 'Тест-режим выключен', 'ٹیسٹ موڈ بند', 'Mode uji mati', 'Testmodus aus', 'テストモード終了', 'Test modu kapalı', '테스트 모드 꺼짐']
  });

  Object.assign(I18N.D, {
    tab_skills: ['Útoky', 'Attacks', '技能', 'हमले', 'Ataques', 'Attaques', 'الهجمات', 'আক্রমণ', 'Ataques', 'Атаки', 'حملے', 'Serangan', 'Angriffe', '必殺技', 'Saldırılar', '공격'],
    skills_eq: ['Do bitvy si bereš 3 útoky', 'You take 3 attacks into battle', '你可带 3 个技能参战', 'युद्ध में 3 हमले ले जाते हैं', 'Llevas 3 ataques a la batalla', 'Tu emportes 3 attaques au combat', 'تأخذ 3 هجمات إلى المعركة', 'যুদ্ধে ৩টি আক্রমণ নাও', 'Você leva 3 ataques à batalha', 'В бой берёшь 3 атаки', 'جنگ میں 3 حملے لے جاتے ہو', 'Bawa 3 serangan ke pertempuran', 'Du nimmst 3 Angriffe mit in die Schlacht', '戦闘には3つ持っていける', 'Savaşa 3 saldırı götürürsün', '전투에 공격 3개를 가져갑니다'],
    skills_help: ['Kup si speciální útoky a vyber 3, které budou v bitvě vpravo dole.', 'Buy special attacks and choose 3 to appear at the bottom right in battle.', '购买特殊技能，选择 3 个显示在战斗右下角。', 'विशेष हमले खरीदें और 3 चुनें जो युद्ध में नीचे दाईं ओर होंगे।', 'Compra ataques especiales y elige 3 para la esquina inferior derecha.', 'Achète des attaques spéciales et choisis-en 3 pour le coin inférieur droit.', 'اشترِ هجمات خاصة واختر 3 تظهر أسفل اليمين في المعركة.', 'বিশেষ আক্রমণ কিনে ৩টি বেছে নাও, যুদ্ধে নিচে ডানে থাকবে।', 'Compre ataques especiais e escolha 3 para o canto inferior direito.', 'Купи особые атаки и выбери 3 – они будут справа внизу в бою.', 'خاص حملے خریدیں اور 3 چنیں جو جنگ میں نیچے دائیں ہوں گے۔', 'Beli serangan khusus dan pilih 3 untuk kanan bawah saat bertempur.', 'Kaufe Spezialangriffe und wähle 3 für unten rechts im Kampf.', '必殺技を買って3つ選ぶと、戦闘の右下に並ぶ。', 'Özel saldırılar al ve savaşta sağ altta olacak 3 tanesini seç.', '특수 공격을 사서 3개를 고르면 전투 오른쪽 아래에 나옵니다.'],
    skill_on: ['V bitvě', 'Equipped', '已装备', 'चयनित', 'Equipado', 'Équipé', 'مجهز', 'নির্বাচিত', 'Equipado', 'Выбрано', 'منتخب', 'Dipakai', 'Ausgerüstet', '装備中', 'Takılı', '장착됨'],
    skill_take: ['Vzít do bitvy', 'Take into battle', '带入战斗', 'युद्ध में लें', 'Llevar', 'Emporter', 'خذه للمعركة', 'যুদ্ধে নাও', 'Levar', 'Взять в бой', 'جنگ میں لیں', 'Bawa', 'Mitnehmen', '持っていく', 'Savaşa al', '전투에 가져가기'],
    skill_min: ['Aspoň jeden útok musíš mít', 'You need at least one attack', '至少需要一个技能', 'कम से कम एक हमला चाहिए', 'Necesitas al menos uno', 'Il en faut au moins une', 'تحتاج هجومًا واحدًا على الأقل', 'অন্তত একটি দরকার', 'Precisa de pelo menos um', 'Нужна хотя бы одна атака', 'کم از کم ایک حملہ چاہیے', 'Minimal satu serangan', 'Mindestens ein Angriff nötig', '最低1つは必要', 'En az bir saldırı gerekli', '최소 하나는 필요합니다'],
    free: ['zdarma', 'free', '免费', 'मुफ़्त', 'gratis', 'gratuit', 'مجانًا', 'বিনামূল্যে', 'grátis', 'бесплатно', 'مفت', 'gratis', 'gratis', '無料', 'ücretsiz', '무료']
  });

  Object.assign(I18N.D, {
    hostages_saved: ['Zachránil jsi {n} rukojmí! +{g} drahokamů', 'You rescued {n} hostages! +{g} gems', '你救出了 {n} 名人质！+{g} 宝石', 'आपने {n} बंधकों को बचाया! +{g} रत्न', '¡Rescataste {n} rehenes! +{g} gemas', 'Tu as sauvé {n} otages ! +{g} gemmes', 'أنقذت {n} رهائن! +{g} جوهرة', 'তুমি {n} জন বন্দিকে উদ্ধার করেছ! +{g} রত্ন', 'Você resgatou {n} reféns! +{g} gemas', 'Ты спас {n} заложников! +{g} самоцветов', 'آپ نے {n} یرغمالیوں کو بچایا! +{g} جواہرات', 'Kamu menyelamatkan {n} sandera! +{g} permata', 'Du hast {n} Geiseln gerettet! +{g} Edelsteine', '人質を{n}人救出！+{g}ジェム', '{n} rehineyi kurtardın! +{g} mücevher', '인질 {n}명을 구출했습니다! +{g} 보석']
  });
})();
